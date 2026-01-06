const multer = require('multer');
// Using Groq Cloud (Whisper + Llama) instead of Google Gemini
const { analyzePronunciation, transcribeAudio } = require('../services/groqService');
const { successResponse, errorResponse } = require('../utils/response');

// Configure multer for audio file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept common audio formats
    const allowedMimes = [
        'audio/webm',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/flac',
        'audio/m4a',
        'audio/mp4',
        'audio/x-m4a'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid audio format: ${file.mimetype}. Accepted formats: webm, wav, mp3, ogg, flac, m4a`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    }
});

// Middleware for single audio file upload
const uploadAudio = upload.single('audio');

/**
 * Handle audio upload and pronunciation assessment
 * POST /api/assessment/analyze
 */
const analyzeHandler = async (req, res) => {
    console.log('\n========== ASSESSMENT CONTROLLER START ==========');
    console.log(`[Controller] Request received at: ${new Date().toISOString()}`);
    console.log(`[Controller] Request headers:`, {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Bearer ***' : 'MISSING'
    });

    try {
        // ========== FILE VALIDATION ==========
        console.log('[Controller] Checking uploaded file...');
        console.log(`[Controller] req.file object:`, req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            bufferLength: req.file.buffer?.length
        } : 'NO FILE UPLOADED');

        if (!req.file) {
            console.error('[Controller] ❌ No audio file in request');
            return errorResponse(res, 400, 'No audio file provided. Please upload an audio file.', {
                error_code: 'NO_FILE',
                hint: 'Ensure the form field name is "audio" and file is attached'
            });
        }

        if (!req.file.buffer || req.file.buffer.length === 0) {
            console.error('[Controller] ❌ Audio file buffer is empty');
            return errorResponse(res, 400, 'Audio file is empty.', {
                error_code: 'EMPTY_FILE'
            });
        }

        // ========== TARGET SENTENCE VALIDATION ==========
        const { targetSentence } = req.body;
        console.log(`[Controller] Target sentence: "${targetSentence}"`);
        
        if (!targetSentence || targetSentence.trim().length === 0) {
            console.error('[Controller] ❌ Target sentence missing');
            return errorResponse(res, 400, 'Target sentence is required for assessment.', {
                error_code: 'NO_TARGET_SENTENCE'
            });
        }

        console.log(`[Controller] ✅ Validation passed`);
        console.log(`[Controller] Processing audio: ${req.file.originalname}, ${req.file.size} bytes, ${req.file.mimetype}`);

        // ========== CALL GEMINI SERVICE ==========
        console.log('[Controller] 🚀 Calling Gemini service...');
        const assessment = await analyzePronunciation(
            req.file.buffer,
            targetSentence.trim(),
            req.file.mimetype
        );

        console.log(`[Controller] ✅ Assessment received: Score ${assessment.overall_score}/100`);
        console.log('========== ASSESSMENT CONTROLLER END ==========\n');

        return successResponse(res, 200, 'Pronunciation assessment completed', {
            assessment,
            metadata: {
                targetSentence: targetSentence.trim(),
                audioSize: req.file.size,
                audioType: req.file.mimetype,
                processedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('\n========== ASSESSMENT CONTROLLER ERROR ==========');
        console.error(`[Controller] ❌ Error: ${error.message}`);
        console.error(`[Controller] ❌ Stack: ${error.stack}`);
        console.error('========== END CONTROLLER ERROR ==========\n');
        
        // ========== SPECIFIC ERROR RESPONSES FOR FRONTEND (Groq compatible) ==========
        const errorMsg = error.message || '';
        
        // API Key errors
        if (errorMsg.includes('API_KEY_MISSING') || errorMsg.includes('API_KEY_INVALID')) {
            return errorResponse(res, 503, 'AI service configuration error. API key issue.', {
                error_code: 'API_KEY_ERROR',
                error_detail: errorMsg,
                suggestion: 'Get a free Groq API key at https://console.groq.com/keys'
            });
        }
        
        // Rate limit (Groq)
        if (errorMsg.includes('RATE_LIMITED') || errorMsg.includes('rate') || error.status === 429) {
            return errorResponse(res, 429, 'AI service rate limited. Please wait and try again.', {
                error_code: 'RATE_LIMITED',
                error_detail: errorMsg,
                suggestion: 'Groq free tier has generous limits. Wait a few seconds and retry.'
            });
        }
        
        // Server errors
        if (errorMsg.includes('SERVER_ERROR') || error.status >= 500) {
            return errorResponse(res, 503, 'AI service temporarily unavailable.', {
                error_code: 'SERVICE_UNAVAILABLE',
                error_detail: errorMsg
            });
        }
        
        // Network errors
        if (errorMsg.includes('NETWORK_ERROR')) {
            return errorResponse(res, 503, 'Cannot connect to AI service.', {
                error_code: 'NETWORK_ERROR',
                error_detail: errorMsg
            });
        }
        
        // Invalid request
        if (errorMsg.includes('INVALID_REQUEST') || errorMsg.includes('INVALID_AUDIO') || errorMsg.includes('format')) {
            return errorResponse(res, 400, 'Invalid audio format or request.', {
                error_code: 'INVALID_INPUT',
                error_detail: errorMsg
            });
        }
        
        // Generic error with full details for debugging
        return errorResponse(res, 500, 'Failed to analyze pronunciation.', {
            error_code: 'UNKNOWN_ERROR',
            error_detail: errorMsg,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Transcribe audio to text
 * POST /api/assessment/transcribe
 */
const transcribeHandler = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 400, 'No audio file provided.');
        }

        console.log(`[Transcribe] Processing audio: ${req.file.originalname}`);

        const transcription = await transcribeAudio(
            req.file.buffer,
            req.file.mimetype
        );

        return successResponse(res, 200, 'Transcription completed', {
            transcription,
            metadata: {
                audioSize: req.file.size,
                audioType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('[Transcribe] Error:', error);
        return errorResponse(res, 500, 'Failed to transcribe audio.', error.message);
    }
};

/**
 * Health check for assessment service
 * GET /api/assessment/health
 */
const healthCheck = (req, res) => {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    return successResponse(res, 200, 'Assessment service status', {
        status: hasApiKey ? 'ready' : 'misconfigured',
        geminiConfigured: hasApiKey,
        maxFileSize: '10MB',
        supportedFormats: ['webm', 'wav', 'mp3', 'ogg', 'flac', 'm4a']
    });
};

// Wrapper to handle multer errors
const handleUpload = (handler) => {
    return (req, res, next) => {
        uploadAudio(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return errorResponse(res, 400, 'Audio file too large. Maximum size is 10MB.');
                }
                return errorResponse(res, 400, `Upload error: ${err.message}`);
            } else if (err) {
                return errorResponse(res, 400, err.message);
            }
            handler(req, res, next);
        });
    };
};

module.exports = {
    analyzeHandler: handleUpload(analyzeHandler),
    transcribeHandler: handleUpload(transcribeHandler),
    healthCheck
};
