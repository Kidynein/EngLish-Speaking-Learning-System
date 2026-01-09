const Groq = require('groq-sdk');
const { successResponse, errorResponse } = require('../utils/response');
const Subscription = require('../models/Subscription');
const path = require('path');
const fs = require('fs');

// Load chatbot configuration from JSON file
const configPath = path.join(__dirname, '../config/chatbot-config.json');
let chatbotConfig = {};

try {
    const configData = fs.readFileSync(configPath, 'utf8');
    chatbotConfig = JSON.parse(configData);
    console.log('[ChatController] Loaded chatbot config:', chatbotConfig.name);
} catch (error) {
    console.error('[ChatController] Failed to load chatbot config:', error.message);
    // Fallback default config
    chatbotConfig = {
        model: 'llama-3.3-70b-versatile',
        maxTokens: 1024,
        temperature: 0.7,
        requiredPlan: 'pro',
        rateLimit: { maxRequestsPerMinute: 10 },
        systemPrompt: 'You are an English tutor.',
        blockedKeywords: []
    };
}

// Initialize Groq client
const GROQ_API_KEY = process.env.GROQ_API_KEY;
let groq = null;

try {
    if (GROQ_API_KEY) {
        groq = new Groq({ apiKey: GROQ_API_KEY });
    }
} catch (error) {
    console.error('[ChatController] Failed to initialize Groq:', error.message);
}

// Store conversation history per user (in production, use Redis or DB)
const conversationHistory = new Map();
const MAX_HISTORY_LENGTH = 20;

/**
 * Check for blocked keywords in message
 */
function containsBlockedKeywords(message) {
    const blockedKeywords = chatbotConfig.blockedKeywords || [];
    const lowerMessage = message.toLowerCase();
    return blockedKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
    maxRequestsPerMinute: chatbotConfig.rateLimit?.maxRequestsPerMinute || 10,
    requestCounts: new Map()
};

/**
 * Check if subscription is still valid (active OR cancelled but within period)
 */
function isSubscriptionValid(subscription, requiredPlan) {
    if (!subscription) return false;
    
    // Check if plan matches
    if (subscription.plan !== requiredPlan) return false;
    
    // Active subscription is always valid
    if (subscription.status === 'active') return true;
    
    // Cancelled subscription is valid until currentPeriodEnd
    if (subscription.status === 'cancelled' && subscription.currentPeriodEnd) {
        const endDate = new Date(subscription.currentPeriodEnd);
        return endDate > new Date();
    }
    
    return false;
}

/**
 * Check rate limit for user
 */
function checkRateLimit(userId) {
    const now = Date.now();
    const userRequests = RATE_LIMIT.requestCounts.get(userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= RATE_LIMIT.maxRequestsPerMinute) {
        return false;
    }
    
    recentRequests.push(now);
    RATE_LIMIT.requestCounts.set(userId, recentRequests);
    return true;
}

/**
 * Get or initialize conversation history for user
 */
function getConversationHistory(userId) {
    if (!conversationHistory.has(userId)) {
        conversationHistory.set(userId, []);
    }
    return conversationHistory.get(userId);
}

/**
 * Add message to conversation history
 */
function addToHistory(userId, role, content) {
    const history = getConversationHistory(userId);
    history.push({ role, content });
    
    // Keep only last N messages to prevent token overflow
    if (history.length > MAX_HISTORY_LENGTH) {
        history.splice(0, history.length - MAX_HISTORY_LENGTH);
    }
}

/**
 * Clear conversation history for user
 */
function clearHistory(userId) {
    conversationHistory.delete(userId);
}

const chatController = {
    /**
     * Send a message to the AI tutor
     */
    sendMessage: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { message, context } = req.body;

            // Validate input
            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return errorResponse(res, 400, 'Message is required');
            }

            if (message.length > 2000) {
                return errorResponse(res, 400, 'Message too long. Maximum 2000 characters.');
            }

            // Check for blocked keywords
            if (containsBlockedKeywords(message)) {
                return errorResponse(res, 400, chatbotConfig.errorMessages?.outOfScope || 'This topic is not allowed.');
            }

            // Check if user has Pro subscription (active or cancelled but within period)
            const requiredPlan = chatbotConfig.requiredPlan || 'pro';
            const subscription = await Subscription.findByUserId(userId);
            if (!isSubscriptionValid(subscription, requiredPlan)) {
                return errorResponse(res, 403, `AI Tutor is only available for ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} subscribers`);
            }

            // Check rate limit
            if (!checkRateLimit(userId)) {
                return errorResponse(res, 429, chatbotConfig.errorMessages?.rateLimit || 'Too many requests. Please wait a moment.');
            }

            // Check Groq client
            if (!groq) {
                return errorResponse(res, 503, chatbotConfig.errorMessages?.serverError || 'AI service is currently unavailable');
            }

            // Build messages array with history
            const history = getConversationHistory(userId);
            const systemPrompt = chatbotConfig.systemPrompt || 'You are an English tutor.';
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: message }
            ];

            // Add optional context (e.g., current topic being studied)
            if (context) {
                messages[0].content += `\n\n**Current Learning Context:** ${context}`;
            }

            // Call Groq API with config settings
            const completion = await groq.chat.completions.create({
                model: chatbotConfig.model || 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: chatbotConfig.temperature || 0.7,
                max_tokens: chatbotConfig.maxTokens || 1024,
                top_p: 0.9,
                stream: false
            });

            const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

            // Save to history
            addToHistory(userId, 'user', message);
            addToHistory(userId, 'assistant', aiResponse);

            return successResponse(res, 200, 'Message sent successfully', {
                response: aiResponse,
                conversationLength: getConversationHistory(userId).length / 2
            });

        } catch (error) {
            console.error('[ChatController] sendMessage error:', error);
            
            if (error.status === 429) {
                return errorResponse(res, 429, 'AI service is busy. Please try again in a moment.');
            }
            
            return errorResponse(res, 500, chatbotConfig.errorMessages?.serverError || 'Failed to get AI response', error.message);
        }
    },

    /**
     * Get conversation history
     */
    getHistory: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Check Pro subscription (active or cancelled but within period)
            const requiredPlan = chatbotConfig.requiredPlan || 'pro';
            const subscription = await Subscription.findByUserId(userId);
            if (!isSubscriptionValid(subscription, requiredPlan)) {
                return errorResponse(res, 403, `AI Tutor is only available for ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} subscribers`);
            }

            const history = getConversationHistory(userId);
            
            // Format history for frontend
            const formattedHistory = [];
            for (let i = 0; i < history.length; i += 2) {
                if (history[i] && history[i + 1]) {
                    formattedHistory.push({
                        userMessage: history[i].content,
                        aiResponse: history[i + 1].content,
                        timestamp: Date.now() - (history.length - i) * 60000 // Approximate timestamps
                    });
                }
            }

            return successResponse(res, 200, 'History retrieved', {
                messages: formattedHistory,
                totalMessages: formattedHistory.length
            });

        } catch (error) {
            console.error('[ChatController] getHistory error:', error);
            return errorResponse(res, 500, 'Failed to get history');
        }
    },

    /**
     * Clear conversation history
     */
    clearHistory: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Check Pro subscription (active or cancelled but within period)
            const requiredPlan = chatbotConfig.requiredPlan || 'pro';
            const subscription = await Subscription.findByUserId(userId);
            if (!isSubscriptionValid(subscription, requiredPlan)) {
                return errorResponse(res, 403, `AI Tutor is only available for ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} subscribers`);
            }

            clearHistory(userId);

            return successResponse(res, 200, 'Conversation history cleared');

        } catch (error) {
            console.error('[ChatController] clearHistory error:', error);
            return errorResponse(res, 500, 'Failed to clear history');
        }
    },

    /**
     * Quick actions - predefined prompts from config
     */
    quickAction: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { action, data } = req.body;

            // Check Pro subscription (active or cancelled but within period)
            const requiredPlan = chatbotConfig.requiredPlan || 'pro';
            const subscription = await Subscription.findByUserId(userId);
            if (!isSubscriptionValid(subscription, requiredPlan)) {
                return errorResponse(res, 403, `AI Tutor is only available for ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} subscribers`);
            }

            if (!groq) {
                return errorResponse(res, 503, 'AI service is currently unavailable');
            }

            // Get prompt from config
            const quickActionConfig = chatbotConfig.quickActions?.[action];
            let prompt = '';
            
            if (quickActionConfig && quickActionConfig.prompt) {
                // Use prompt from config, replace {input} with data
                prompt = quickActionConfig.prompt.replace('{input}', data);
            } else {
                // Fallback to default prompts
                switch (action) {
                    case 'explain_grammar':
                        prompt = `Explain this English grammar concept in detail with examples: "${data}"`;
                        break;
                    case 'translate':
                        prompt = `Translate this to English and explain any important grammar or vocabulary: "${data}"`;
                        break;
                    case 'vocabulary':
                        prompt = `Teach me about this English word/phrase with pronunciation (IPA), meaning, usage examples, and common collocations: "${data}"`;
                        break;
                    case 'correct_writing':
                        prompt = `Please correct and improve this English text, explaining all corrections:\n\n"${data}"`;
                        break;
                    case 'practice_conversation':
                        prompt = `Let's practice a conversation about: "${data}". Start the conversation and I'll respond.`;
                        break;
                    case 'pronunciation':
                        prompt = `Guide me on how to pronounce: "${data}"`;
                        break;
                    case 'conversation':
                        prompt = `Create a sample conversation about: "${data}"`;
                        break;
                    case 'ielts_tip':
                        prompt = `Give me an IELTS preparation tip for: "${data}"`;
                        break;
                    default:
                        return errorResponse(res, 400, 'Invalid action type');
                }
            }

            // Call Groq API
            const systemPrompt = chatbotConfig.systemPrompt || 'You are an English tutor.';
            const completion = await groq.chat.completions.create({
                model: chatbotConfig.model || 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: chatbotConfig.temperature || 0.7,
                max_tokens: chatbotConfig.maxTokens || 1024,
                top_p: 0.9
            });

            const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

            // Save to history
            addToHistory(userId, 'user', prompt);
            addToHistory(userId, 'assistant', aiResponse);

            return successResponse(res, 200, 'Quick action completed', {
                action,
                response: aiResponse
            });

        } catch (error) {
            console.error('[ChatController] quickAction error:', error);
            return errorResponse(res, 500, 'Failed to process action', error.message);
        }
    },

    /**
     * Check AI tutor access status
     */
    checkAccess: async (req, res) => {
        try {
            const userId = req.user.userId;
            const requiredPlan = chatbotConfig.requiredPlan || 'pro';
            
            const subscription = await Subscription.findByUserId(userId);
            const hasAccess = isSubscriptionValid(subscription, requiredPlan);

            return successResponse(res, 200, 'Access status retrieved', {
                hasAccess,
                plan: subscription?.plan || 'free',
                status: subscription?.status || 'none',
                endDate: subscription?.currentPeriodEnd || null,
                requiredPlan: requiredPlan,
                botName: chatbotConfig.name || 'EduBot'
            });

        } catch (error) {
            console.error('[ChatController] checkAccess error:', error);
            return errorResponse(res, 500, 'Failed to check access');
        }
    },

    /**
     * Get chatbot configuration (public info only)
     */
    getConfig: async (req, res) => {
        try {
            return successResponse(res, 200, 'Config retrieved', {
                name: chatbotConfig.name || 'EduBot',
                description: chatbotConfig.description || 'AI English Tutor',
                requiredPlan: chatbotConfig.requiredPlan || 'pro',
                quickActions: Object.keys(chatbotConfig.quickActions || {}).map(key => ({
                    action: key,
                    label: chatbotConfig.quickActions[key].label,
                    icon: chatbotConfig.quickActions[key].icon
                })),
                welcomeMessage: chatbotConfig.welcomeMessage
            });
        } catch (error) {
            console.error('[ChatController] getConfig error:', error);
            return errorResponse(res, 500, 'Failed to get config');
        }
    }
};

module.exports = chatController;
