/**
 * Test suite for scoring utility functions
 * This file demonstrates various test cases for the speech scoring algorithm
 * Run in Node.js: node testScoringUtils.js
 * Or test in browser console by copying the scoringUtils.js functions
 */

// Import would work in real environment
// import { calculateScore, generateFeedback } from '../utils/scoringUtils';

// Test cases
const testCases = [
    {
        name: "Perfect Match",
        target: "Hello world",
        spoken: "Hello world",
        expectedScore: 100,
        description: "Exact match should give 100% score"
    },
    {
        name: "Case Insensitive",
        target: "Hello World",
        spoken: "hello world",
        expectedScore: 100,
        description: "Case should not matter"
    },
    {
        name: "One Wrong Word",
        target: "The cat is sleeping",
        spoken: "The dog is sleeping",
        expectedScore: 75, // 3 out of 4 correct
        description: "One incorrect word out of four"
    },
    {
        name: "Missing Word",
        target: "I love programming",
        spoken: "I love",
        expectedScore: 67, // 2 out of 3
        description: "User didn't complete the sentence"
    },
    {
        name: "Extra Words",
        target: "Good morning",
        spoken: "Good good morning",
        expectedScore: 85, // Penalty for extra words
        description: "User repeated a word"
    },
    {
        name: "Completely Wrong",
        target: "The sky is blue",
        spoken: "My name is John",
        expectedScore: 0,
        description: "No matching words"
    },
    {
        name: "Partial Match (Similar Words)",
        target: "Running quickly",
        spoken: "Run quick",
        expectedScore: 70, // Partial credit for similar words
        description: "Similar but not exact words"
    },
    {
        name: "No Speech",
        target: "Hello everyone",
        spoken: "",
        expectedScore: 0,
        description: "User said nothing"
    },
    {
        name: "Punctuation Test",
        target: "Hello, how are you?",
        spoken: "Hello how are you",
        expectedScore: 100,
        description: "Punctuation should be ignored"
    },
    {
        name: "Real ELSA-like Sentence",
        target: "The weather is beautiful today",
        spoken: "The weather is beautiful today",
        expectedScore: 100,
        description: "Common English practice sentence"
    }
];

// Simulate the scoring function results
console.log("═══════════════════════════════════════════════════════");
console.log("  SPEECH SCORING ALGORITHM - TEST RESULTS");
console.log("═══════════════════════════════════════════════════════\n");

testCases.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`Target:   "${test.target}"`);
    console.log(`Spoken:   "${test.spoken}"`);
    console.log(`Expected: ~${test.expectedScore}%`);
    console.log(`Description: ${test.description}`);
    console.log("─".repeat(55));

    // In real usage, you would call:
    // const result = calculateScore(test.target, test.spoken);
    // console.log(`Actual Score: ${result.overallScore}%`);
    // console.log(`Breakdown:`);
    // console.log(`  - Pronunciation: ${result.pronunciationScore}%`);
    // console.log(`  - Fluency: ${result.fluencyScore}%`);
    // console.log(`  - Confidence: ${result.confidenceScore}%`);
    // console.log(`Word Feedback:`, result.feedback);
    // console.log(`Feedback Message: ${generateFeedback(result)}`);

    console.log("\n");
});

console.log("═══════════════════════════════════════════════════════");
console.log("  HOW TO USE IN YOUR APPLICATION");
console.log("═══════════════════════════════════════════════════════\n");

console.log(`
Example Usage:

1. In React Component:
   import { calculateScore, generateFeedback } from '../utils/scoringUtils';
   
   const handleScoring = () => {
       const targetText = "Hello world";
       const spokenText = transcript; // From useSpeechRecognition hook
       
       const scoreData = calculateScore(targetText, spokenText);
       const message = generateFeedback(scoreData);
       
       console.log('Score:', scoreData.overallScore);
       console.log('Message:', message);
       console.log('Word Feedback:', scoreData.feedback);
   };

2. Word Feedback Structure:
   [
       { word: "Hello", status: "correct" },
       { word: "world", status: "incorrect", expected: "world", spoken: "word" }
   ]
   
   Status types:
   - "correct"   → Green (exact match)
   - "incorrect" → Red (wrong word)
   - "partial"   → Yellow (similar word, partial credit)
   - "missing"   → Gray strikethrough (word not spoken)

3. Score Breakdown:
   - overallScore: Weighted average (0-100)
   - pronunciationScore: Word accuracy
   - fluencyScore: Speech completeness and speed
   - confidenceScore: Overall performance

4. Backend Data Mapping:
   {
       scoreOverall: scoreData.overallScore,
       scorePronunciation: scoreData.pronunciationScore,
       scoreFluency: scoreData.fluencyScore,
       scoreConfidence: scoreData.confidenceScore,
       aiFeedbackJson: JSON.stringify({
           transcript: spokenText,
           targetText: targetText,
           wordFeedback: scoreData.feedback,
           correctWords: scoreData.correctWords,
           totalWords: scoreData.wordCount
       })
   }
`);

console.log("═══════════════════════════════════════════════════════\n");

/**
 * Frontend Testing Instructions:
 * 
 * 1. Open your React app in browser
 * 2. Open Developer Console (F12)
 * 3. Import the scoring utilities:
 *    const { calculateScore, generateFeedback } = await import('/src/utils/scoringUtils.js');
 * 
 * 4. Test scoring:
 *    const result = calculateScore("Hello world", "Hello world");
 *    console.log(result);
 * 
 * 5. Test with different inputs:
 *    calculateScore("The cat is sleeping", "The dog is sleeping");
 *    calculateScore("Good morning", ""); // No speech
 */

/**
 * Backend Testing with curl:
 * 
 * curl -X POST http://localhost:5000/api/exercise-attempts \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -d '{
 *     "sessionId": 1,
 *     "exerciseId": 1,
 *     "userAudioUrl": null,
 *     "scoreOverall": 85.50,
 *     "scorePronunciation": 87.00,
 *     "scoreFluency": 82.00,
 *     "scoreConfidence": 86.00,
 *     "aiFeedbackJson": "{\"transcript\":\"hello world\",\"targetText\":\"hello world\",\"wordFeedback\":[{\"word\":\"hello\",\"status\":\"correct\"},{\"word\":\"world\",\"status\":\"correct\"}],\"correctWords\":2,\"totalWords\":2}"
 *   }'
 */

module.exports = { testCases };
