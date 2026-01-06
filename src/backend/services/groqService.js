const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ========== API KEY VALIDATION & INITIALIZATION ==========
console.log('\n========== GROQ SERVICE INITIALIZATION ==========');

// Get API key from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Debug logging (secure - only shows status, not the key)
console.log(`[Groq] API Key status: ${GROQ_API_KEY ? 'LOADED' : 'MISSING'}`);
console.log(`[Groq] API Key length: ${GROQ_API_KEY?.length || 0} characters`);
console.log(`[Groq] API Key prefix: ${GROQ_API_KEY ? GROQ_API_KEY.substring(0, 8) + '...' : 'N/A'}`);

// Validate API key format (Groq keys start with 'gsk_')
const isValidFormat = GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_') && GROQ_API_KEY.length > 20;
console.log(`[Groq] API Key format valid: ${isValidFormat ? 'YES' : 'NO'}`);

if (!GROQ_API_KEY) {
    console.error('[Groq] ❌ CRITICAL ERROR: GROQ_API_KEY is missing in .env file!');
    console.error('[Groq] Please add GROQ_API_KEY=gsk_xxxxx to config/test.env');
    console.error('[Groq] Get your free API key at: https://console.groq.com/keys');
} else if (!isValidFormat) {
    console.error('[Groq] ⚠️ WARNING: GROQ_API_KEY format looks invalid.');
    console.error('[Groq] Groq API keys should start with "gsk_" and be ~56 characters.');
}

// Initialize Groq client with explicit API key
let groq = null;
let initializationError = null;

try {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is missing in .env file');
    }
    
    groq = new Groq({
        apiKey: GROQ_API_KEY
    });
    
    console.log('[Groq] ✅ Groq client initialized successfully');
} catch (error) {
    initializationError = error;
    console.error(`[Groq] ❌ Failed to initialize Groq client: ${error.message}`);
}

/**
 * Test connection to Groq API on startup
 * Verifies the API key works before any user requests
 */
async function testConnection() {
    console.log('\n[Groq] 🔍 Testing API connection...');
    
    if (!groq) {
        console.error('[Groq] ❌ Connection test FAILED: Client not initialized');
        return { success: false, error: 'Client not initialized' };
    }
    
    try {
        // Simple test: list available models
        const models = await groq.models.list();
        console.log(`[Groq] ✅ Connection test PASSED! Found ${models.data?.length || 0} models`);
        console.log(`[Groq] Available models: ${models.data?.slice(0, 3).map(m => m.id).join(', ')}...`);
        return { success: true, models: models.data?.length || 0 };
    } catch (error) {
        console.error(`[Groq] ❌ Connection test FAILED: ${error.message}`);
        if (error.status === 401) {
            console.error('[Groq] 🔑 Invalid API key! Please check your GROQ_API_KEY');
        }
        return { success: false, error: error.message };
    }
}

// Run connection test on module load (async)
testConnection().then(result => {
    if (result.success) {
        console.log('[Groq] 🚀 Service ready to accept requests\n');
    } else {
        console.error(`[Groq] ⚠️ Service may not work correctly: ${result.error}\n`);
    }
});

console.log('========== END GROQ INITIALIZATION ==========\n');

// ========== RATE LIMITING & RETRY CONFIG ==========
const RETRY_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2
};

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000; // 1 second between requests

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute with exponential backoff retry
 */
async function withRetry(fn, context = 'API call') {
    let lastError;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;
            
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
                const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
                console.log(`[Groq] Rate limiting: waiting ${waitTime}ms...`);
                await sleep(waitTime);
            }
            
            lastRequestTime = Date.now();
            return await fn();
            
        } catch (error) {
            lastError = error;
            const isRetryable = error.status === 429 || 
                               error.status === 503 || 
                               error.status === 500 ||
                               error.message?.toLowerCase().includes('rate');
            
            if (!isRetryable || attempt === RETRY_CONFIG.maxRetries) {
                throw error;
            }
            
            const delay = Math.min(
                RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
                RETRY_CONFIG.maxDelayMs
            );
            
            console.log(`[Groq] ⚠️ ${context} attempt ${attempt}/${RETRY_CONFIG.maxRetries} failed`);
            console.log(`[Groq] 🔄 Retrying in ${delay}ms...`);
            
            await sleep(delay);
        }
    }
    
    throw lastError;
}

/**
 * JSON Schema for pronunciation assessment (same as Gemini version)
 */
const ASSESSMENT_SCHEMA = {
    overall_score: "integer 0-100",
    scores: {
        pronunciation: "integer 0-100",
        fluency: "integer 0-100", 
        confidence: "integer 0-100"
    },
    word_analysis: [{
        word: "string - target word",
        is_correct: "boolean",
        heard_as: "string - what user said",
        ipa_target: "string - IPA pronunciation",
        error_type: "none|substitution|omission|insertion|distortion"
    }],
    feedback_message: "string - encouraging feedback"
};

// ========== TEXT NORMALIZATION HELPERS ==========

/**
 * Normalize text for comparison
 * - Converts to lowercase
 * - Removes punctuation
 * - Trims whitespace
 * - Normalizes multiple spaces to single space
 */
function normalizeText(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .trim()
        // Remove punctuation (keep letters, numbers, spaces)
        .replace(/[.,!?;:'"()\-–—\[\]{}]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calculate word-level similarity between two texts
 * Returns a value between 0 and 1
 */
function calculateSimilarity(text1, text2) {
    const words1 = normalizeText(text1).split(/\s+/).filter(w => w.length > 0);
    const words2 = normalizeText(text2).split(/\s+/).filter(w => w.length > 0);
    
    if (words1.length === 0 || words2.length === 0) {
        return { similarity: 0, matchedWords: 0, totalWords: Math.max(words1.length, words2.length) };
    }
    
    let matchCount = 0;
    const matchedPairs = [];
    
    for (const w1 of words1) {
        for (const w2 of words2) {
            // Exact match or fuzzy match (one contains the other, useful for short words)
            if (w1 === w2 || (w1.length > 3 && w2.includes(w1)) || (w2.length > 3 && w1.includes(w2))) {
                matchCount++;
                matchedPairs.push({ target: w1, spoken: w2 });
                break;
            }
        }
    }
    
    const similarity = matchCount / words1.length;
    
    return {
        similarity,
        matchedWords: matchCount,
        totalWords: words1.length,
        matchedPairs
    };
}

/**
 * Pre-check for obviously off-topic content
 * Saves API calls by detecting jailbreak/off-topic attempts locally
 * NOW WITH CASE-INSENSITIVE COMPARISON
 */
function isOffTopicContent(userTranscription, targetSentence) {
    if (!userTranscription || userTranscription.trim().length === 0) {
        return { isOffTopic: false, reason: 'empty', similarity: 0 };
    }

    // Normalize both texts for fair comparison
    const normalizedTranscript = normalizeText(userTranscription);
    const normalizedTarget = normalizeText(targetSentence);
    
    console.log(`[OffTopic] Normalized target: "${normalizedTarget}"`);
    console.log(`[OffTopic] Normalized transcript: "${normalizedTranscript}"`);

    // QUICK CHECK: If normalized texts are identical or very similar, NOT off-topic
    if (normalizedTranscript === normalizedTarget) {
        console.log(`[OffTopic] ✅ EXACT MATCH after normalization`);
        return { isOffTopic: false, reason: 'exact_match', similarity: 1.0 };
    }

    // Keywords that indicate off-topic/jailbreak attempts
    const offTopicPatterns = [
        // Questions (but not if it matches target)
        /^(who is|what is|where is|when is|why is|how is|can you|could you|will you|would you|do you|are you|is there)/i,
        // Code-related
        /(function\s*\(|const\s+\w|let\s+\w|var\s+\w|import\s+|export\s+|console\.|print\(|def\s+|class\s+\w|return\s+|if\s*\()/i,
        // General assistant requests
        /(help me with|write me a|tell me about|explain to me|describe the|create a|generate a|give me a|show me how)/i,
        // Jailbreak attempts
        /(ignore previous|forget your|disregard|pretend you|act as if|you are now|new instructions|system prompt)/i,
    ];

    // Only check patterns if transcript is significantly different from target
    const simResult = calculateSimilarity(normalizedTarget, normalizedTranscript);
    console.log(`[OffTopic] Similarity: ${(simResult.similarity * 100).toFixed(1)}% (${simResult.matchedWords}/${simResult.totalWords} words)`);
    
    // If similarity is above 50%, it's likely a valid attempt (even with errors)
    if (simResult.similarity >= 0.5) {
        console.log(`[OffTopic] ✅ High similarity - valid pronunciation attempt`);
        return { isOffTopic: false, reason: 'high_similarity', similarity: simResult.similarity };
    }

    // Check off-topic patterns only for low-similarity transcripts
    for (const pattern of offTopicPatterns) {
        if (pattern.test(normalizedTranscript)) {
            console.log(`[OffTopic] ⚠️ Detected off-topic pattern: ${pattern}`);
            return { isOffTopic: true, reason: 'pattern_match', similarity: simResult.similarity };
        }
    }

    // For very short targets (single words), be more lenient
    if (normalizedTarget.split(/\s+/).length <= 2) {
        // Single word targets - check if transcript contains the word
        if (normalizedTranscript.includes(normalizedTarget) || normalizedTarget.includes(normalizedTranscript)) {
            console.log(`[OffTopic] ✅ Short target word found in transcript`);
            return { isOffTopic: false, reason: 'short_target_match', similarity: 0.8 };
        }
    }

    // Only mark as off-topic if similarity is very low AND transcript is long
    const transcriptWords = normalizedTranscript.split(/\s+/).filter(w => w.length > 0);
    if (simResult.similarity < 0.1 && transcriptWords.length > 5) {
        console.log(`[OffTopic] ⚠️ Very low similarity with long transcript - likely off-topic`);
        return { isOffTopic: true, reason: 'low_similarity', similarity: simResult.similarity };
    }

    // Default: Not off-topic, let Llama analyze it
    console.log(`[OffTopic] ✅ Passing to Llama for detailed analysis`);
    return { isOffTopic: false, reason: 'needs_analysis', similarity: simResult.similarity };
}

/**
 * Generate off-topic response without calling LLM
 */
function generateOffTopicResponse(targetSentence, reason) {
    return {
        overall_score: 0,
        scores: {
            pronunciation: 0,
            fluency: 0,
            confidence: 0
        },
        word_analysis: [],
        feedback_message: `Please focus on reading the target sentence aloud: "${targetSentence}"`
    };
}

/**
 * Step 1: Transcribe audio using Whisper Large V3
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} mimeType - MIME type of the audio
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
    console.log('\n========== GROQ WHISPER TRANSCRIPTION START ==========');
    console.log(`[Whisper] Audio buffer size: ${audioBuffer?.length || 0} bytes`);
    console.log(`[Whisper] MIME type: ${mimeType}`);

    // Check if client is initialized
    if (!groq) {
        console.error('[Whisper] ❌ Groq client not initialized');
        throw new Error('API_KEY_MISSING: GROQ_API_KEY is not configured. Get a free key at https://console.groq.com/keys');
    }

    if (!GROQ_API_KEY) {
        throw new Error('API_KEY_MISSING: GROQ_API_KEY is not configured');
    }

    if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('INVALID_AUDIO: Audio buffer is empty');
    }

    // Determine file extension from MIME type
    const extMap = {
        'audio/webm': '.webm',
        'audio/wav': '.wav',
        'audio/wave': '.wav',
        'audio/mp3': '.mp3',
        'audio/mpeg': '.mp3',
        'audio/ogg': '.ogg',
        'audio/flac': '.flac',
        'audio/m4a': '.m4a',
        'audio/mp4': '.m4a'
    };
    
    const ext = extMap[mimeType] || '.webm';
    const tempFilePath = path.join(os.tmpdir(), `groq_audio_${Date.now()}${ext}`);

    try {
        // Write buffer to temp file (Groq SDK requires file path or stream)
        fs.writeFileSync(tempFilePath, audioBuffer);
        console.log(`[Whisper] Temp file created: ${tempFilePath}`);

        // Create file stream for Groq
        const audioFile = fs.createReadStream(tempFilePath);

        console.log('[Whisper] 🚀 Sending to Groq Whisper API...');
        const startTime = Date.now();

        // Call Groq Whisper API with retry
        const transcription = await withRetry(async () => {
            return await groq.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-large-v3',
                language: 'en',
                response_format: 'text'
            });
        }, 'Whisper transcription');

        const responseTime = Date.now() - startTime;
        console.log(`[Whisper] ✅ Transcription completed in ${responseTime}ms`);
        console.log(`[Whisper] Result: "${transcription}"`);
        console.log('========== GROQ WHISPER TRANSCRIPTION END ==========\n');

        return transcription.trim();

    } catch (error) {
        console.error('[Whisper] ❌ Transcription error:', error.message);
        throw error;
    } finally {
        // Clean up temp file
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log(`[Whisper] Temp file cleaned up`);
            }
        } catch (e) {
            console.warn('[Whisper] Failed to clean up temp file:', e.message);
        }
    }
}

/**
 * Step 2: Analyze pronunciation using Llama 3.3 70B
 * @param {string} targetSentence - The sentence user should have read
 * @param {string} userTranscription - What the user actually said (from Whisper)
 * @returns {Promise<Object>} - Assessment result in JSON format
 */
async function analyzePronunciationWithLlama(targetSentence, userTranscription) {
    console.log('\n========== GROQ LLAMA ANALYSIS START ==========');
    console.log(`[Llama] Target: "${targetSentence}"`);
    console.log(`[Llama] User said: "${userTranscription}"`);

    // Check if client is initialized
    if (!groq) {
        console.error('[Llama] ❌ Groq client not initialized');
        throw new Error('API_KEY_MISSING: GROQ_API_KEY is not configured. Get a free key at https://console.groq.com/keys');
    }

    if (!GROQ_API_KEY) {
        throw new Error('API_KEY_MISSING: GROQ_API_KEY is not configured');
    }

    // ========== STRICT PRONUNCIATION COACH SYSTEM PROMPT ==========
    const systemPrompt = `You are a STRICT, PROFESSIONAL English Pronunciation Coach. Your ONLY job is to compare the User's Transcript with the Target Sentence and score their pronunciation accuracy.

=== CRITICAL IDENTITY RULES ===
1. You are NOT a general assistant. You CANNOT answer questions, write code, or chat.
2. You ONLY analyze pronunciation by comparing what the user SAID vs what they SHOULD have said.
3. You NEVER provide information unrelated to pronunciation assessment.

=== GUARDRAILS (ZERO TOLERANCE) ===
If the User's Transcript contains ANY of these, treat it as OFF-TOPIC and return score 0:
- Questions (e.g., "Who are you?", "What is...?", "Can you help me?")
- Code requests (e.g., "Write code", "function", "import", "console.log")
- General knowledge (e.g., facts, weather, news, math problems)
- Conversations (e.g., "Hello how are you", "Tell me a joke")
- Content completely unrelated to the Target Sentence

=== CASE-INSENSITIVE MATCHING (CRITICAL!) ===
ALWAYS compare words in lowercase. These are ALL CORRECT matches:
- "Strategy" vs "strategy" → CORRECT (same word, different case)
- "Hello" vs "hello" → CORRECT
- "WORLD" vs "world" → CORRECT
Ignore capitalization, punctuation differences. Focus on SOUNDS, not spelling.

=== SIMILARITY CHECK ===
Calculate word overlap between Target and User Transcript (CASE-INSENSITIVE):
- Compare words in lowercase: "Strategy".toLowerCase() === "strategy".toLowerCase()
- If less than 20% of target words appear in user's speech → OFF-TOPIC → Score = 0
- If user says nothing or silence → Score = 0 with encouraging feedback

=== SCORING RULES (Only for relevant attempts) ===
- Pronunciation (0-100): Word Error Rate based. 100 = exact match (case-insensitive), -10 per wrong word
- Fluency (0-100): How complete/natural the reading was
- Confidence (0-100): Clarity of speech (clear = high, mumbled = low)
- Overall Score: (Pronunciation×0.5) + (Fluency×0.3) + (Confidence×0.2)

=== ERROR TYPES ===
- "none": Word pronounced correctly
- "substitution": User said a different word
- "omission": User skipped/missed the word  
- "insertion": User added extra words
- "distortion": Word was unclear/partial

=== FEEDBACK MESSAGE RULES ===
GOOD feedback (about pronunciation):
- "Excellent! Your pronunciation of '[word]' was perfect!"
- "Good job! Try to pronounce the 'th' sound in '[word]' more clearly."
- "You missed the word '[word]'. Please read the full sentence."

BAD feedback (NEVER do this):
- "The capital of France is Paris." (answering questions)
- "Here is the code you requested..." (writing code)
- "I can help you with that!" (being a general assistant)

=== JSON OUTPUT FOR OFF-TOPIC INPUT ===
If input is irrelevant/off-topic, you MUST return EXACTLY:
{
  "overall_score": 0,
  "scores": { "pronunciation": 0, "fluency": 0, "confidence": 0 },
  "word_analysis": [],
  "feedback_message": "Please focus on reading the target sentence. Say: '[INSERT TARGET SENTENCE HERE]'"
}

=== JSON OUTPUT FOR VALID ATTEMPTS ===
{
  "overall_score": <0-100>,
  "scores": {
    "pronunciation": <0-100>,
    "fluency": <0-100>,
    "confidence": <0-100>
  },
  "word_analysis": [
    {
      "word": "<target word>",
      "is_correct": <boolean>,
      "heard_as": "<what user said or 'MISSING'>",
      "ipa_target": "<IPA transcription>",
      "error_type": "<none|substitution|omission|insertion|distortion>"
    }
  ],
  "feedback_message": "<feedback about pronunciation ONLY, no emojis>"
}

REMEMBER: You are a pronunciation scorer, NOT an assistant. NEVER answer questions or engage in conversation.`;

    const userPrompt = `=== PRONUNCIATION ASSESSMENT TASK ===

TARGET SENTENCE (what user should read): "${targetSentence}"

USER'S TRANSCRIPT (what they actually said): "${userTranscription || '(SILENCE - no speech detected)'}"

=== YOUR TASK ===
1. First, check if user's speech is RELEVANT to the target sentence
2. If OFF-TOPIC (questions, code, unrelated content) → Return score 0 with redirect message
3. If RELEVANT → Compare word-by-word and calculate scores

Return ONLY valid JSON. No explanations, no markdown, no extra text.`;

    try {
        console.log('[Llama] 🚀 Sending to Groq Llama API...');
        const startTime = Date.now();

        const completion = await withRetry(async () => {
            return await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });
        }, 'Llama analysis');

        const responseTime = Date.now() - startTime;
        console.log(`[Llama] ✅ Analysis completed in ${responseTime}ms`);

        const jsonText = completion.choices[0]?.message?.content;
        console.log(`[Llama] Response length: ${jsonText?.length || 0} characters`);

        // Parse JSON response
        let assessment;
        try {
            assessment = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('[Llama] Failed to parse response:', jsonText);
            throw new Error('INVALID_JSON: Failed to parse Llama response');
        }

        // Validate and normalize scores
        assessment.overall_score = Math.min(100, Math.max(0, assessment.overall_score || 0));
        assessment.scores = assessment.scores || {};
        assessment.scores.pronunciation = Math.min(100, Math.max(0, assessment.scores.pronunciation || 0));
        assessment.scores.fluency = Math.min(100, Math.max(0, assessment.scores.fluency || 0));
        assessment.scores.confidence = Math.min(100, Math.max(0, assessment.scores.confidence || 0));
        assessment.word_analysis = assessment.word_analysis || [];
        assessment.feedback_message = assessment.feedback_message || 'Keep practicing!';

        console.log(`[Llama] ✅ Final score: ${assessment.overall_score}/100`);
        console.log(`[Llama] Feedback: ${assessment.feedback_message}`);
        console.log('========== GROQ LLAMA ANALYSIS END ==========\n');

        return assessment;

    } catch (error) {
        console.error('[Llama] ❌ Analysis error:', error.message);
        throw error;
    }
}

/**
 * Main function: Full pronunciation assessment pipeline
 * Step 1: Transcribe audio with Whisper
 * Step 2: Analyze with Llama
 * 
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} targetSentence - The sentence user should have read
 * @param {string} mimeType - MIME type of the audio file
 * @returns {Promise<Object>} - Assessment result matching the original schema
 */
async function analyzePronunciation(audioBuffer, targetSentence, mimeType = 'audio/webm') {
    console.log('\n' + '='.repeat(60));
    console.log('GROQ PRONUNCIATION ASSESSMENT PIPELINE');
    console.log('='.repeat(60));
    console.log(`[Pipeline] Target: "${targetSentence}"`);
    console.log(`[Pipeline] Audio: ${audioBuffer?.length || 0} bytes, ${mimeType}`);

    // Validate inputs
    if (!GROQ_API_KEY) {
        throw new Error('API_KEY_MISSING: GROQ_API_KEY is not configured in environment variables');
    }

    if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('INVALID_AUDIO: Audio buffer is empty or missing');
    }

    if (!targetSentence || targetSentence.trim().length === 0) {
        throw new Error('INVALID_INPUT: Target sentence is empty');
    }

    const pipelineStartTime = Date.now();

    try {
        // ========== STEP 1: TRANSCRIBE ==========
        console.log('\n[Pipeline] 📝 Step 1: Transcribing audio with Whisper...');
        const userTranscription = await transcribeAudio(audioBuffer, mimeType);
        console.log(`[Pipeline] Transcription result: "${userTranscription}"`);

        // ========== STEP 1.5: PRE-CHECK FOR OFF-TOPIC CONTENT ==========
        console.log('\n[Pipeline] 🔍 Step 1.5: Checking for off-topic content...');
        console.log(`[Pipeline] Comparing (normalized):`);
        console.log(`   - Target: "${targetSentence.toLowerCase().trim()}"`);
        console.log(`   - Transcription: "${userTranscription.toLowerCase().trim()}"`);
        const offTopicCheck = isOffTopicContent(userTranscription, targetSentence);
        
        if (offTopicCheck.isOffTopic) {
            console.log(`[Pipeline] ⚠️ OFF-TOPIC DETECTED! Reason: ${offTopicCheck.reason}`);
            console.log('[Pipeline] Returning zero score without LLM call (saves API quota)');
            
            const offTopicResponse = generateOffTopicResponse(targetSentence, offTopicCheck.reason);
            offTopicResponse.transcription = userTranscription;
            
            const totalTime = Date.now() - pipelineStartTime;
            console.log('\n' + '='.repeat(60));
            console.log(`[Pipeline] ✅ COMPLETE (OFF-TOPIC) in ${totalTime}ms`);
            console.log(`[Pipeline] Final Score: 0/100 (off-topic content)`);
            console.log('='.repeat(60) + '\n');
            
            return offTopicResponse;
        }
        
        console.log(`[Pipeline] ✅ Content appears relevant (similarity: ${((offTopicCheck.similarity || 0) * 100).toFixed(1)}%)`);

        // ========== STEP 2: ANALYZE ==========
        console.log('\n[Pipeline] 🧠 Step 2: Analyzing with Llama...');
        const assessment = await analyzePronunciationWithLlama(targetSentence, userTranscription);

        // Add transcription to assessment for reference
        assessment.transcription = userTranscription;

        const totalTime = Date.now() - pipelineStartTime;
        console.log('\n' + '='.repeat(60));
        console.log(`[Pipeline] ✅ COMPLETE in ${totalTime}ms`);
        console.log(`[Pipeline] Final Score: ${assessment.overall_score}/100`);
        console.log('='.repeat(60) + '\n');

        return assessment;

    } catch (error) {
        console.error('\n========== GROQ PIPELINE ERROR ==========');
        console.error(`[Pipeline] ❌ Error: ${error.message}`);
        console.error(`[Pipeline] ❌ Status: ${error.status || 'N/A'}`);
        console.error('==========================================\n');

        // Categorize errors
        const errorMsg = error.message?.toLowerCase() || '';
        
        if (error.status === 401 || errorMsg.includes('api key') || errorMsg.includes('unauthorized')) {
            throw new Error('API_KEY_INVALID: The Groq API key is invalid. Get a free key at https://console.groq.com/keys');
        }
        
        if (error.status === 429 || errorMsg.includes('rate') || errorMsg.includes('limit')) {
            throw new Error('RATE_LIMITED: Groq API rate limit reached. Please wait a moment and try again.');
        }
        
        if (error.status >= 500) {
            throw new Error('SERVER_ERROR: Groq API server error. Please try again later.');
        }

        throw error;
    }
}

/**
 * Simple transcription only (utility function)
 */
async function transcribeOnly(audioBuffer, mimeType = 'audio/webm') {
    return await transcribeAudio(audioBuffer, mimeType);
}

module.exports = {
    analyzePronunciation,
    transcribeAudio: transcribeOnly,
    analyzePronunciationWithLlama
};
