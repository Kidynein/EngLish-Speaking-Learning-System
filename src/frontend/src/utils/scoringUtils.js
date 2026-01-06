/**
 * Calculate pronunciation score by comparing target sentence with spoken text
 * Uses word-level comparison with case-insensitive matching
 * 
 * @param {string} targetText - The correct sentence the user should speak
 * @param {string} spokenText - The transcribed text from speech recognition
 * @returns {Object} { overallScore, pronunciationScore, fluencyScore, confidenceScore, feedback, wordCount, correctWords }
 */
export const calculateScore = (targetText, spokenText) => {
    // Handle edge cases
    if (!targetText || targetText.trim() === '') {
        return {
            overallScore: 0,
            pronunciationScore: 0,
            fluencyScore: 0,
            confidenceScore: 0,
            feedback: [],
            wordCount: 0,
            correctWords: 0,
            errorMessage: 'Target text is empty'
        };
    }

    if (!spokenText || spokenText.trim() === '') {
        const targetWords = normalizeText(targetText).split(/\s+/);
        return {
            overallScore: 0,
            pronunciationScore: 0,
            fluencyScore: 0,
            confidenceScore: 0,
            feedback: targetWords.map(word => ({
                word,
                status: 'missing',
                expected: word
            })),
            wordCount: targetWords.length,
            correctWords: 0,
            errorMessage: 'No speech detected'
        };
    }

    // Normalize both texts (lowercase, remove punctuation, trim)
    const normalizedTarget = normalizeText(targetText);
    const normalizedSpoken = normalizeText(spokenText);

    // Split into words
    const targetWords = normalizedTarget.split(/\s+/);
    const spokenWords = normalizedSpoken.split(/\s+/);

    // Word-by-word comparison using dynamic programming (Levenshtein-based alignment)
    const feedback = alignWords(targetWords, spokenWords);

    // Calculate correct words
    const correctWords = feedback.filter(item => item.status === 'correct').length;
    const totalWords = targetWords.length;

    // Calculate overall score (accuracy percentage)
    const accuracyScore = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;

    // Calculate pronunciation score (same as accuracy for now, since we lack audio analysis)
    const pronunciationScore = accuracyScore;

    // Calculate fluency score based on word count matching
    // Penalize if spoken text is significantly longer or shorter
    const lengthRatio = spokenWords.length / totalWords;
    let fluencyScore = accuracyScore;

    if (lengthRatio > 1.3) {
        // Too many words spoken (hesitation, filler words)
        fluencyScore = Math.max(0, accuracyScore - 15);
    } else if (lengthRatio < 0.7) {
        // Too few words spoken (incomplete)
        fluencyScore = Math.max(0, accuracyScore - 20);
    }

    // Calculate confidence score (mock based on overall performance)
    // In real app, this would come from audio analysis
    const confidenceScore = accuracyScore > 90 ? accuracyScore : Math.max(0, accuracyScore - 5);

    // Overall score is weighted average
    const overallScore = Math.round(
        (accuracyScore * 0.4) +
        (pronunciationScore * 0.3) +
        (fluencyScore * 0.2) +
        (confidenceScore * 0.1)
    );

    return {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        pronunciationScore: Math.round(Math.min(100, Math.max(0, pronunciationScore))),
        fluencyScore: Math.round(Math.min(100, Math.max(0, fluencyScore))),
        confidenceScore: Math.round(Math.min(100, Math.max(0, confidenceScore))),
        feedback,
        wordCount: totalWords,
        correctWords,
        spokenWordCount: spokenWords.length
    };
};

/**
 * Normalize text for comparison
 * - Convert to lowercase
 * - Remove punctuation and special characters
 * - Trim and normalize whitespace
 */
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[.,!?;:'"(){}[\]]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
};

/**
 * Align spoken words with target words and determine status
 * Uses simple sequential matching with tolerance for small errors
 */
const alignWords = (targetWords, spokenWords) => {
    const feedback = [];
    let spokenIndex = 0;

    for (let i = 0; i < targetWords.length; i++) {
        const targetWord = targetWords[i];

        if (spokenIndex >= spokenWords.length) {
            // User didn't say this word
            feedback.push({
                word: targetWord,
                status: 'missing',
                expected: targetWord
            });
            continue;
        }

        const spokenWord = spokenWords[spokenIndex];

        // Check for exact match
        if (targetWord === spokenWord) {
            feedback.push({
                word: targetWord,
                status: 'correct',
                spoken: spokenWord
            });
            spokenIndex++;
        }
        // Check for partial match (e.g., "running" vs "run")
        else if (isSimilar(targetWord, spokenWord)) {
            feedback.push({
                word: targetWord,
                status: 'partial',
                expected: targetWord,
                spoken: spokenWord
            });
            spokenIndex++;
        }
        // Check if the next spoken word matches (skipped a word)
        else if (spokenIndex + 1 < spokenWords.length && targetWord === spokenWords[spokenIndex + 1]) {
            // Current spoken word is extra, mark target as incorrect
            feedback.push({
                word: targetWord,
                status: 'incorrect',
                expected: targetWord,
                spoken: spokenWord
            });
            spokenIndex += 2; // Skip the extra word and move to matching word
        }
        // Word is incorrect
        else {
            feedback.push({
                word: targetWord,
                status: 'incorrect',
                expected: targetWord,
                spoken: spokenWord
            });
            spokenIndex++;
        }
    }

    return feedback;
};

/**
 * Check if two words are similar (same start, or one contains the other)
 * Used for partial credit (e.g., "hello" vs "helo")
 */
const isSimilar = (word1, word2) => {
    if (word1.length < 3 || word2.length < 3) return false;

    // Check if one word contains the other
    if (word1.includes(word2) || word2.includes(word1)) return true;

    // Check if they start with the same 3 characters
    if (word1.substring(0, 3) === word2.substring(0, 3)) return true;

    // Calculate simple edit distance
    const distance = levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);

    // Consider similar if edit distance is less than 25% of word length
    return distance / maxLength < 0.25;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Generate AI feedback text based on score
 * This is a fallback when Gemini AI feedback is not available
 * @param {Object} scoreData - Score data object
 * @param {string} [aiFeedback] - Optional AI-generated feedback from Gemini
 * @returns {string} Feedback message
 */
export const generateFeedback = (scoreData, aiFeedback = null) => {
    // If AI feedback is provided, use it directly
    if (aiFeedback && typeof aiFeedback === 'string' && aiFeedback.trim().length > 0) {
        return aiFeedback;
    }

    const { overallScore, feedback, correctWords, wordCount } = scoreData;

    // Find words with errors for specific feedback
    const incorrectWords = feedback?.filter(w => w.status === 'incorrect' || w.status === 'partial') || [];
    const firstError = incorrectWords.length > 0 ? incorrectWords[0] : null;

    if (overallScore >= 95) {
        return "Outstanding! Your pronunciation is excellent and sounds very natural!";
    } else if (overallScore >= 90) {
        return "Excellent work! Your pronunciation is nearly perfect. Keep it up!";
    } else if (overallScore >= 85) {
        if (firstError) {
            return `Great job! Just a small tip: pay attention to "${firstError.word}" for even better results.`;
        }
        return "Great job! Your pronunciation is very clear. Keep practicing!";
    } else if (overallScore >= 70) {
        if (firstError) {
            return `Good effort! Focus on pronouncing "${firstError.word}" more clearly. You're improving!`;
        }
        return "Good effort! Focus on the highlighted words for improvement. You're making progress!";
    } else if (overallScore >= 50) {
        if (firstError) {
            return `Keep practicing! Try saying "${firstError.word}" more slowly. Break it into syllables if needed.`;
        }
        return "Keep practicing! Try speaking more slowly and clearly. Every practice counts!";
    } else {
        if (firstError) {
            return `Don't give up! Let's focus on "${firstError.word}" first. Say it slowly and listen carefully.`;
        }
        return "Don't give up! Try speaking more slowly and clearly. Practice makes perfect!";
    }
};
