/**
 * ZenStudy - AI Well-being Engine
 * Parses student journals to evaluate Stress, Burnout, and Self-Doubt,
 * and provides contextual coping strategies, either locally or via the Gemini API.
 */

window.AIEngine = {
    // Basic Local Keyword Maps
    stressKeywords: [
        'stress', 'anxious', 'pressure', 'syllabus', 'time', 'test', 'exam', 'marks', 
        'backlog', 'study', 'maths', 'physics', 'chemistry', 'biology', 'practice', 
        'fear', 'parent', 'expect', 'coaching', 'preparation', 'nervous', 'scared'
    ],
    burnoutKeywords: [
        'tired', 'exhausted', 'blank', 'drain', 'heavy', 'sleep', 'fatigue', 'headache',
        'burnout', 'give up', 'done', 'cannot focus', 'quit', 'quit studying', 'sick',
        'bored', 'lazy', 'hopeless', 'overwhelmed', 'routine', 'unmotivated', 'force'
    ],
    selfDoubtKeywords: [
        'fail', 'doubt', 'not good enough', 'behind', 'marks', 'score', 'percentile',
        'rank', 'everyone else', 'stupid', 'impossible', 'succeed', 'cannot do', 'forgetting',
        'worthless', 'compete', 'weak', 'mock test', 'cutoff', 'selection', 'worry'
    ],

    /**
     * Analyze journal text locally using keyword density and basic heuristics
     * @param {string} text - Open-ended journal content
     * @param {string} exam - E.g. "JEE", "NEET", "GATE", "CAT", "CUET", "Board"
     * @returns {Object} Analysis metrics and tailored feedback
     */
    analyzeLocally: function(text, exam) {
        const lowerText = text.toLowerCase();
        
        let stressHits = 0;
        let burnoutHits = 0;
        let doubtHits = 0;

        this.stressKeywords.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'g');
            const matches = lowerText.match(regex);
            if (matches) stressHits += matches.length;
        });

        this.burnoutKeywords.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'g');
            const matches = lowerText.match(regex);
            if (matches) burnoutHits += matches.length;
        });

        this.selfDoubtKeywords.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'g');
            const matches = lowerText.match(regex);
            if (matches) doubtHits += matches.length;
        });

        // Compute scores out of 100 based on hits relative to length
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length || 1;
        const multiplier = Math.max(10, Math.min(25, Math.ceil(150 / wordCount))); // Scale for short logs

        let stressScore = Math.min(95, Math.max(20, stressHits * multiplier * 12));
        let burnoutScore = Math.min(95, Math.max(15, burnoutHits * multiplier * 12));
        let doubtScore = Math.min(95, Math.max(10, doubtHits * multiplier * 12));

        // Adjust default scores for light logs
        if (wordCount < 5) {
            stressScore = 30;
            burnoutScore = 20;
            doubtScore = 15;
        }

        // Generate tailored wellness support tips
        let feedbackTitle = "AI Wellness Reflection";
        let feedbackText = "";
        
        if (stressScore > 70 || burnoutScore > 70 || doubtScore > 70) {
            feedbackTitle = "Severe Stress/Burnout Detected";
            if (burnoutScore >= stressScore && burnoutScore >= doubtScore) {
                feedbackText = `Your journal shows signs of heavy fatigue. Preparing for ${exam} is a marathon, not a sprint. Please step away from books for the next 30 minutes. Try the visual breathing exercise in our 'Mindful Zone' and focus on getting at least 7 hours of sleep tonight. Success follows a rested mind.`;
            } else if (doubtScore >= stressScore) {
                feedbackText = `We detected critical levels of self-doubt. Remember, mock tests and syllabus sizes do not define your worth. Everyone preparing for ${exam} goes through periods where they feel behind. Celebrate small victories today. You are capable, and taking things one concept at a time is the best path forward.`;
            } else {
                feedbackText = `Your stress markers are elevated. The high stakes of ${exam} can feel overwhelming. Let's break today's study load into smaller, manageable chunks. Consider using our grounding exercises (SOS Grounding) if the pressure starts to feel physical. You are not alone in this journey.`;
            }
        } else {
            feedbackTitle = "Healthy Progress Underway";
            feedbackText = `You are managing your ${exam} prep style well. Your stress and burnout markers are in a manageable zone. Continue journaling daily, and make sure to schedule 10 minutes of screen-free buffer time after every 2 hours of active learning to sustain this momentum.`;
        }

        return {
            stress: Math.round(stressScore),
            burnout: Math.round(burnoutScore),
            doubt: Math.round(doubtScore),
            feedbackTitle: feedbackTitle,
            feedbackText: feedbackText,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Query live Gemini API
     * @param {string} apiKey - Users Gemini API Key
     * @param {string} promptText - Constructed instruction prompt
     */
    queryGemini: async function(apiKey, promptText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: promptText
                    }]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Failed to contact Gemini API");
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    },

    /**
     * Live Journal Analysis using Gemini API
     */
    analyzeWithGemini: async function(apiKey, text, exam) {
        if (apiKey) {
            const systemPrompt = `You are ZenStudy, an expert empathetic AI mental well-being companion for students preparing for high-stakes tests (currently preparing for ${exam}).
Analyze the following student daily journal log:
"${text}"

Evaluate the student's level (0 to 100) of:
1. Stress
2. Burnout
3. Self-Doubt

Also provide an empathetic analysis title (e.g. "Coping with Chemistry Mock scores") and a hyper-personalized, contextual coping strategy (under 120 words). Encourage adaptive breathing or motivational strategies.

You MUST respond strictly in the following JSON format:
{
  "stress": 75,
  "burnout": 60,
  "doubt": 80,
  "feedbackTitle": "Understanding Exam Pressure",
  "feedbackText": "Empathetic tailored strategy here..."
}`;

            const rawResult = await this.queryGemini(apiKey, systemPrompt);
            
            // Sanitize response in case LLM wraps it in markdown code blocks
            let cleanJsonStr = rawResult.trim();
            if (cleanJsonStr.startsWith("```")) {
                cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            }

            const parsed = JSON.parse(cleanJsonStr);
            return {
                stress: Number(parsed.stress) || 50,
                burnout: Number(parsed.burnout) || 50,
                doubt: Number(parsed.doubt) || 50,
                feedbackTitle: parsed.feedbackTitle || "AI Wellness Reflection",
                feedbackText: parsed.feedbackText || "Keep moving forward, one step at a time.",
                timestamp: new Date().toISOString()
            };
        } else {
            // Route through Flask local backend
            const state = window.AppState.get();
            const baseUrl = state.settings.backendUrl ? state.settings.backendUrl.replace(/\/$/, '') : '';
            const response = await fetch(`${baseUrl}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, exam })
            });

            if (!response.ok) {
                throw new Error("Local backend analysis failed or server is offline");
            }
            return await response.json();
        }
    },

    /**
     * Get chatbot response from Gemini
     */
    getCompanionChat: async function(apiKey, history, companionName, companionPrompt, exam, latestUserMessage) {
        if (apiKey) {
            const prompt = `You are ${companionName}, a supportive AI chatbot companion for a student preparing for the ${exam} exam.
Your profile/role instructions: "${companionPrompt}"
Here is the conversation history:
${history.map(h => `${h.sender.toUpperCase()}: ${h.text}`).join('\n')}
USER: ${latestUserMessage}

Give a warm, personalized, contextual reply (max 100 words). Be empathetic, offer direct coping/focus tips, and ask a supporting follow-up. Do not sound generic.`;
            
            return await this.queryGemini(apiKey, prompt);
        } else {
            // Route through Flask local backend
            const state = window.AppState.get();
            const baseUrl = state.settings.backendUrl ? state.settings.backendUrl.replace(/\/$/, '') : '';
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    history,
                    companionName,
                    companionPrompt,
                    exam,
                    latestUserMessage
                })
            });

            if (!response.ok) {
                throw new Error("Local backend chat failed or server is offline");
            }
            const data = await response.json();
            return data.reply;
        }
    }
};
