const { GoogleGenerativeAI } = require('@google/generative-ai');

// ========== API KEY VALIDATION ==========
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('========== GEMINI SERVICE INITIALIZATION ==========');
console.log(`[Gemini] API Key loaded: ${GEMINI_API_KEY ? 'YES (' + GEMINI_API_KEY.substring(0, 10) + '...)' : 'NO - MISSING!'}`);
console.log(`[Gemini] API Key length: ${GEMINI_API_KEY?.length || 0} characters`);

if (!GEMINI_API_KEY) {
    console.error('[Gemini] ❌ CRITICAL ERROR: GEMINI_API_KEY is missing in .env file!');
    console.error('[Gemini] Please add GEMINI_API_KEY=your-api-key to config/test.env');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'missing-api-key');

// ========== RATE LIMITING & RETRY CONFIG ==========
const RETRY_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 2000,  // Start with 2 seconds
    maxDelayMs: 16000,     // Max 16 seconds
    backoffMultiplier: 2   // Double delay each retry
};

// Track last request time to prevent rapid requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 4000; // Minimum 4 seconds between requests (15 RPM = 4s interval)

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute with exponential backoff retry
 */
async function withRetry(fn, context = 'API call') {
    let lastError;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            // Enforce minimum interval between requests
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;
            
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
                const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
                console.log(`[Retry] Rate limiting: waiting ${waitTime}ms before request...`);
                await sleep(waitTime);
            }
            
            lastRequestTime = Date.now();
            return await fn();
            
        } catch (error) {
            lastError = error;
            const isRetryable = error.status === 429 || 
                               error.status === 503 || 
                               error.status === 500 ||
                               error.message?.toLowerCase().includes('quota') ||
                               error.message?.toLowerCase().includes('rate') ||
                               error.message?.toLowerCase().includes('too many');
            
            if (!isRetryable || attempt === RETRY_CONFIG.maxRetries) {
                console.error(`[Retry] ${context} failed after ${attempt} attempts. Not retryable or max retries reached.`);
                throw error;
            }
            
            const delay = Math.min(
                RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
                RETRY_CONFIG.maxDelayMs
            );
            
            console.log(`[Retry] ⚠️ ${context} attempt ${attempt}/${RETRY_CONFIG.maxRetries} failed with ${error.status || 'unknown'} error`);
            console.log(`[Retry] 🔄 Retrying in ${delay}ms (exponential backoff)...`);
            
            await sleep(delay);
        }
    }
    
    throw lastError;
}

// JSON Schema for pronunciation assessment
const ASSESSMENT_SCHEMA = {
    type: "object",
    properties: {
        overall_score: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Overall pronunciation score from 0-100"
        },
        scores: {
            type: "object",
            properties: {
                pronunciation: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                    description: "Accuracy of individual sounds and phonemes"
                },
                fluency: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                    description: "Smoothness and natural rhythm of speech"
                },
                confidence: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                    description: "Confidence level based on voice clarity and hesitation"
                }
            },
            required: ["pronunciation", "fluency", "confidence"]
        },
        word_analysis: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    word: {
                        type: "string",
                        description: "The target word from the sentence"
                    },
                    is_correct: {
                        type: "boolean",
                        description: "Whether the word was pronounced correctly"
                    },
                    heard_as: {
                        type: "string",
                        description: "What the user actually said (phonetic approximation in English spelling). Use the same word if correct."
                    },
                    ipa_target: {
                        type: "string",
                        description: "IPA transcription of the correct pronunciation"
                    },
                    error_type: {
                        type: "string",
                        enum: ["none", "substitution", "omission", "insertion", "distortion"],
                        description: "Type of pronunciation error if any"
                    }
                },
                required: ["word", "is_correct", "heard_as", "ipa_target", "error_type"]
            }
        },
        feedback_message: {
            type: "string",
            description: "Encouraging feedback message with specific tips for improvement"
        }
    },
    required: ["overall_score", "scores", "word_analysis", "feedback_message"]
};

/**
 * Analyze pronunciation using Google Gemini API
 * @param {Buffer} audioBuffer - Audio file buffer (webm, wav, mp3, etc.)
 * @param {string} targetSentence - The sentence the user should have read
 * @param {string} mimeType - MIME type of the audio file (default: audio/webm)
 * @returns {Promise<Object>} - Assessment result in JSON format
 */
async function analyzePronunciation(audioBuffer, targetSentence, mimeType = 'audio/webm') {
    console.log('\n========== GEMINI PRONUNCIATION ANALYSIS START ==========');
    console.log(`[Gemini] Target sentence: "${targetSentence}"`);
    console.log(`[Gemini] Audio buffer size: ${audioBuffer?.length || 0} bytes`);
    console.log(`[Gemini] MIME type: ${mimeType}`);
    console.log(`[Gemini] API Key present: ${!!GEMINI_API_KEY}`);

    // ========== PRE-FLIGHT CHECKS ==========
    if (!GEMINI_API_KEY) {
        console.error('[Gemini] ❌ API Key is missing in .env');
        throw new Error('API_KEY_MISSING: GEMINI_API_KEY is not configured in environment variables');
    }

    if (!audioBuffer || audioBuffer.length === 0) {
        console.error('[Gemini] ❌ Audio buffer is empty');
        throw new Error('INVALID_AUDIO: Audio buffer is empty or missing');
    }

    if (!targetSentence || targetSentence.trim().length === 0) {
        console.error('[Gemini] ❌ Target sentence is empty');
        throw new Error('INVALID_INPUT: Target sentence is empty');
    }

    // Validate MIME type
    const supportedMimes = ['audio/webm', 'audio/wav', 'audio/wave', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/flac', 'audio/m4a', 'audio/mp4'];
    if (!supportedMimes.some(m => mimeType.includes(m.split('/')[1]))) {
        console.warn(`[Gemini] ⚠️ Unusual MIME type: ${mimeType}, proceeding anyway...`);
    }

    try {
        console.log('[Gemini] Creating model instance...');
        
        // Get Gemini Flash model with JSON output
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: ASSESSMENT_SCHEMA,
                temperature: 0.1, // Low temperature for consistent scoring
            },
        });

        console.log('[Gemini] Model created: gemini-2.0-flash');

        // System instruction for strict phonetic analysis
        const systemInstruction = `You are an expert English pronunciation coach and phonetic analyst with a warm, encouraging teaching style.
Your task is to analyze audio recordings and provide detailed pronunciation assessments.

CRITICAL RULES:
1. Listen VERY carefully to each word in the audio
2. Compare pronunciation strictly against the target sentence
3. Analyze phonemes, word stress, and intonation patterns
4. Be accurate but encouraging in your feedback
5. If a word is mispronounced, write what you ACTUALLY heard using English spelling approximation
6. Score fairly - native speakers typically score 85-100, intermediate learners 60-84, beginners 40-59

SCORING CRITERIA:
- Pronunciation (0-100): Individual sound accuracy, phoneme clarity
- Fluency (0-100): Speech flow, rhythm, pausing, hesitation
- Confidence (0-100): Voice clarity, volume consistency, conviction

ERROR TYPES:
- "none": Word pronounced correctly
- "substitution": A sound was replaced with another (e.g., "th" → "d")
- "omission": A sound was left out (e.g., "asked" → "ask")
- "insertion": Extra sound was added (e.g., "film" → "filum")
- "distortion": Sound was unclear or malformed

FEEDBACK MESSAGE RULES (VERY IMPORTANT):
Generate a personalized, human-like feedback message (1-2 sentences) based on the overall_score:

- HIGH SCORE (90-100): Praise enthusiastically! Examples:
  "Outstanding! Your pronunciation is excellent and your intonation sounds very natural!"
  "Fantastic job! You nailed every word perfectly. Keep up the great work!"
  "Brilliant! Your English sounds incredibly fluent and clear!"

- MEDIUM SCORE (70-89): Give balanced, encouraging feedback. Mention specific areas to improve. Examples:
  "Good job! Your pronunciation is solid. Try focusing on the ending sounds of words like '[specific word]'."
  "Nice effort! Pay attention to the 'th' sound in '[word]' - it should be softer."
  "Well done! Work on your rhythm a bit - try not to rush through the sentence."

- LOW SCORE (50-69): Encourage and provide specific guidance. Examples:
  "Keep practicing! You struggled with '[word]' - try breaking it into syllables: [syllables]."
  "Don't give up! Focus on speaking more slowly and clearly, especially with '[word]'."
  "Good try! The word '[word]' needs more practice - listen to how it sounds and try again."

- VERY LOW SCORE (<50): Be extra supportive and helpful. Examples:
  "Every expert was once a beginner! Let's focus on '[word]' first - say it slowly: [pronunciation tip]."
  "Practice makes perfect! Try recording yourself saying just '[word]' several times."
  "Keep going! Start by mastering one word at a time. '[word]' is pronounced like [simple explanation]."

The feedback MUST:
- Be warm and teacher-like (never robotic or generic)
- Reference specific words from the analysis if there are errors
- Provide actionable tips when score is below 90
- Match the tone to the score level
- DO NOT use any emojis or special symbols - use plain English text only`;

        // Construct the user prompt
        const userPrompt = `Analyze this audio recording against the target sentence.

TARGET SENTENCE: "${targetSentence}"

Instructions:
1. Listen to the audio carefully
2. Identify each word spoken and compare with target
3. Note any pronunciation errors with specific details
4. Provide scores for pronunciation, fluency, and confidence
5. Generate a personalized feedback_message based on the overall score (follow the FEEDBACK MESSAGE RULES strictly)

Return ONLY valid JSON matching the required schema.`;

        // Convert audio buffer to base64 for Gemini
        const audioBase64 = audioBuffer.toString('base64');
        console.log(`[Gemini] Audio converted to base64: ${audioBase64.length} characters`);

        // Create the content parts with audio - WRAPPED IN RETRY LOGIC
        console.log('[Gemini] 🚀 Sending request to Gemini API (with retry logic)...');
        const startTime = Date.now();
        
        // Use retry wrapper for the API call
        const result = await withRetry(async () => {
            return await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: audioBase64
                            }
                        },
                        {
                            text: userPrompt
                        }
                    ]
                }],
                systemInstruction: systemInstruction
            });
        }, 'Gemini generateContent');

        const responseTime = Date.now() - startTime;
        console.log(`[Gemini] ✅ Response received in ${responseTime}ms`);

        const response = await result.response;
        const jsonText = response.text();
        console.log(`[Gemini] Response text length: ${jsonText.length} characters`);
        console.log(`[Gemini] Raw response preview: ${jsonText.substring(0, 200)}...`);

        // Parse and validate JSON response
        let assessment;
        try {
            assessment = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', jsonText);
            throw new Error('Invalid JSON response from Gemini');
        }

        // Validate required fields
        if (!assessment.overall_score || !assessment.scores || !assessment.word_analysis) {
            throw new Error('Incomplete assessment data from Gemini');
        }

        // Ensure scores are within valid range
        assessment.overall_score = Math.min(100, Math.max(0, assessment.overall_score));
        assessment.scores.pronunciation = Math.min(100, Math.max(0, assessment.scores.pronunciation));
        assessment.scores.fluency = Math.min(100, Math.max(0, assessment.scores.fluency));
        assessment.scores.confidence = Math.min(100, Math.max(0, assessment.scores.confidence));

        console.log(`[Gemini] ✅ Assessment complete: Score ${assessment.overall_score}/100`);
        console.log(`[Gemini] Feedback: ${assessment.feedback_message?.substring(0, 100)}...`);
        console.log('========== GEMINI PRONUNCIATION ANALYSIS END ==========\n');

        return assessment;

    } catch (error) {
        console.error('\n========== GEMINI API ERROR ==========');
        console.error(`[Gemini] ❌ Error Type: ${error.constructor.name}`);
        console.error(`[Gemini] ❌ Error Message: ${error.message}`);
        console.error(`[Gemini] ❌ Error Status: ${error.status || 'N/A'}`);
        console.error(`[Gemini] ❌ Error StatusText: ${error.statusText || 'N/A'}`);
        
        // Log full error details for debugging
        if (error.errorDetails) {
            console.error(`[Gemini] ❌ Error Details:`, JSON.stringify(error.errorDetails, null, 2));
        }
        
        // Log the full error stack
        console.error(`[Gemini] ❌ Full Error Stack:`, error.stack);
        console.error('========== END GEMINI API ERROR ==========\n');
        
        // ========== SPECIFIC ERROR HANDLING ==========
        const errorMessage = error.message?.toLowerCase() || '';
        const errorStatus = error.status;
        
        // 401 Unauthorized - Invalid API Key
        if (errorStatus === 401 || errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid')) {
            console.error('[Gemini] 🔑 ERROR TYPE: 401 UNAUTHORIZED - Invalid API Key');
            throw new Error('API_KEY_INVALID: The Gemini API key is invalid or unauthorized. Please check your API key.');
        }
        
        // 429 Too Many Requests - Quota Exceeded
        if (errorStatus === 429 || errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('too many')) {
            console.error('[Gemini] 📊 ERROR TYPE: 429 TOO MANY REQUESTS - Quota Exceeded');
            throw new Error('QUOTA_EXCEEDED: Gemini API quota exceeded. Free tier allows 15 RPM and 1500/day. Please wait and try again.');
        }
        
        // 500/503 Server Error - Google side issues
        if (errorStatus >= 500 || errorMessage.includes('server') || errorMessage.includes('unavailable')) {
            console.error('[Gemini] 🔥 ERROR TYPE: 5XX SERVER ERROR - Google side issue');
            throw new Error('SERVER_ERROR: Gemini API server error. Please try again later.');
        }
        
        // 400 Bad Request - Invalid input
        if (errorStatus === 400 || errorMessage.includes('invalid') || errorMessage.includes('format')) {
            console.error('[Gemini] 📝 ERROR TYPE: 400 BAD REQUEST - Invalid input');
            throw new Error('INVALID_REQUEST: Invalid request to Gemini API. Check audio format and input data.');
        }
        
        // Network/Connection errors
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('econnrefused')) {
            console.error('[Gemini] 🌐 ERROR TYPE: NETWORK ERROR - Connection failed');
            throw new Error('NETWORK_ERROR: Failed to connect to Gemini API. Check your internet connection.');
        }
        
        // Unknown error - throw with original message
        console.error('[Gemini] ❓ ERROR TYPE: UNKNOWN');
        throw new Error(`GEMINI_ERROR: ${error.message}`);
    }
}

/**
 * Get a simple transcription of audio (utility function)
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} mimeType - MIME type of the audio
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const audioBase64 = audioBuffer.toString('base64');
        
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioBase64
                        }
                    },
                    {
                        text: 'Transcribe exactly what is spoken in this audio. Return only the transcription, no explanations.'
                    }
                ]
            }]
        });

        return result.response.text().trim();
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
}

module.exports = {
    analyzePronunciation,
    transcribeAudio
};
