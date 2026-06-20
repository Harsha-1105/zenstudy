import os
import re
import json
import time
from flask import Flask, request, jsonify, send_from_directory

# Try loading dotenv for development environments
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__, static_folder='.')

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    return response

# Retrieve API Key from Environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Local keywords fallback logic
STRESS_KEYWORDS = [
    'stress', 'anxious', 'pressure', 'syllabus', 'time', 'test', 'exam', 'marks', 
    'backlog', 'study', 'maths', 'physics', 'chemistry', 'biology', 'practice', 
    'fear', 'parent', 'expect', 'coaching', 'preparation', 'nervous', 'scared'
]
BURNOUT_KEYWORDS = [
    'tired', 'exhausted', 'blank', 'drain', 'heavy', 'sleep', 'fatigue', 'headache',
    'burnout', 'give up', 'done', 'cannot focus', 'quit', 'quit studying', 'sick',
    'bored', 'lazy', 'hopeless', 'overwhelmed', 'routine', 'unmotivated', 'force'
]
DOUBT_KEYWORDS = [
    'fail', 'doubt', 'not good enough', 'behind', 'marks', 'score', 'percentile',
    'rank', 'everyone else', 'stupid', 'impossible', 'succeed', 'cannot do', 'forgetting',
    'worthless', 'compete', 'weak', 'mock test', 'cutoff', 'selection', 'worry'
]

def analyze_locally(text, exam):
    lower_text = text.lower()
    stress_hits = 0
    burnout_hits = 0
    doubt_hits = 0

    for word in STRESS_KEYWORDS:
        matches = re.findall(r'\b' + word + r'\b', lower_text)
        stress_hits += len(matches)

    for word in BURNOUT_KEYWORDS:
        matches = re.findall(r'\b' + word + r'\b', lower_text)
        burnout_hits += len(matches)

    for word in DOUBT_KEYWORDS:
        matches = re.findall(r'\b' + word + r'\b', lower_text)
        doubt_hits += len(matches)

    word_count = len(text.split()) or 1
    multiplier = max(10, min(25, int(150 / word_count)))

    stress_score = min(95, max(20, stress_hits * multiplier * 12))
    burnout_score = min(95, max(15, burnout_hits * multiplier * 12))
    doubt_score = min(95, max(10, doubt_hits * multiplier * 12))

    if word_count < 5:
        stress_score = 30; burnout_score = 20; doubt_score = 15

    feedback_title = "AI Wellness Reflection"
    feedback_text = ""

    if stress_score > 70 or burnout_score > 70 or doubt_score > 70:
        feedback_title = "Severe Stress/Burnout Detected"
        if burnout_score >= stress_score and burnout_score >= doubt_score:
            feedback_text = f"Your journal shows signs of heavy fatigue. Preparing for {exam} is a marathon, not a sprint. Please step away from books for the next 30 minutes. Try the visual breathing exercise in our 'Mindful Zone' and focus on getting at least 7 hours of sleep tonight. Success follows a rested mind."
        elif doubt_score >= stress_score:
            feedback_text = f"We detected critical levels of self-doubt. Remember, mock tests and syllabus sizes do not define your worth. Everyone preparing for {exam} goes through periods where they feel behind. Celebrate small victories today. You are capable, and taking things one concept at a time is the best path forward."
        else:
            feedback_text = f"Your stress markers are elevated. The high stakes of {exam} can feel overwhelming. Let's break today's study load into smaller, manageable chunks. Consider using our grounding exercises (SOS Grounding) if the pressure starts to feel physical. You are not alone in this journey."
    else:
        feedback_title = "Healthy Progress Underway"
        feedback_text = f"You are managing your {exam} prep style well. Your stress and burnout markers are in a manageable zone. Continue journaling daily, and make sure to schedule 10 minutes of screen-free buffer time after every 2 hours of active learning to sustain this momentum."

    return {
        "stress": int(stress_score),
        "burnout": int(burnout_score),
        "doubt": int(doubt_score),
        "feedbackTitle": feedback_title,
        "feedbackText": feedback_text,
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }

def get_local_mock_reply(text, companion_id, exam):
    msg = text.lower()
    if 'die' in msg or 'kill myself' in msg or 'suicide' in msg or 'give up completely' in msg:
        return "Please know that your life is extremely valuable. Competitive tests are just events, not a final measure of your potential. If you're feeling completely overwhelmed, please talk to a parent, friend, or call a helpline. I recommend using the 'SOS Grounding' button in the sidebar right now to help center your thoughts."

    is_fail = any(x in msg for x in ['fail', 'score', 'marks', 'mock', 'rank', 'percentile'])
    is_backlog = any(x in msg for x in ['backlog', 'syllabus', 'behind', 'chapters', 'physics', 'chemistry', 'maths', 'biology'])
    is_parents = any(x in msg for x in ['parent', 'dad', 'mom', 'family', 'expect'])
    is_sleep = any(x in msg for x in ['sleep', 'tired', 'exhausted', 'insomnia', 'night'])

    if companion_id == 'aria':
        if is_fail: return f"I understand how hurtful it is to score lower than expected on mock tests. Mock scores are diagnostic tools, not predictions of your actual {exam} result. Give yourself permission to make mistakes. How about we skip mock reviews for the rest of today and do a gentle topic revision instead?"
        if is_backlog: return f"It's completely normal to feel overwhelmed by the vast {exam} syllabus. A backlog is just an unread chapter, it doesn't define your capacity. Let's breathe. You don't have to cover everything today. Just focus on one simple concept. I'm rooting for you."
        if is_parents: return f"Family expectations can weigh so heavily on top of your own academic pressure. Parents often worry because they want the best for you, though it feels like pressure. Try writing down your feelings or having a gentle cup of tea. Your worth is much larger than a test mark."
        if is_sleep: return "Rest is a critical part of study stamina! Pushing through midnight fatigue causes memory drop-offs. Please prioritize sleep tonight. Can we agree to close the books by 10:30 PM today and rest? Your brain needs it."
        return f"Thank you for sharing that with me. Academic pressure is a massive challenge, especially with {exam}. Please remember to be gentle with yourself. You are making progress, even when it feels slow. What's one positive thing, no matter how small, that happened today?"

    if companion_id == 'leo':
        if is_fail: return f"Mock scores are raw data, nothing else! They highlight weak chapters so you can patch them before the real {exam} exam. Let's do this: list the top 3 question types you got wrong. That is our study blueprint for tomorrow. Don't look back, focus on the review!"
        if is_backlog: return f"Let's tackle this backlog systematically. Trying to study the whole backlog at once causes paralysis. Pick ONE chapter. Set a Pomodoro timer for 25 minutes. Study only that. We are going to build consistency step by step. What chapter are we picking?"
        if is_parents: return f"Pressure from expectation is a distraction. Let's channel that energy directly into execution. Control the controllable: your schedule, your active recall, your breaks. Write down a 2-hour clear focus block for today, and let's get it done."
        if is_sleep: return "Sleep is a high-performance cheat code! Sleep deprivation ruins active memory recall. If you are exhausted, study productivity drops to zero. Close the books. Get 7 hours of high-quality sleep tonight, and let's crush the morning block with full energy!"
        return f"Got it. Let's make an action plan. What is the single highest-yield topic on your {exam} syllabus that you can study for 30 minutes right now? Let's write down a clear objective, start a timer, and clear it off the board."

    if companion_id == 'sia':
        if is_fail: return f"When we look at scoreboards, our thoughts fly into the anxious future. Let's bring them back to the current breath. A mock score is a transient event. Inhale deeply... hold... and release. You are not your scores. You are here, breathing and learning."
        if is_backlog: return f"A mountain of chapters looks overwhelming from the bottom. Focus only on the step right under your foot. You don't have to carry the whole {exam} syllabus in your mind. Breathe in space, let go of the pressure. Just read one paragraph with calm awareness."
        if is_parents: return f"Expectations create ripples of anxiety in our quiet spaces. Recognize that their expectations are external, and your peace is internal. Allow yourself to release their expectations on the exhale. You are doing your best."
        if is_sleep: return "Let's prepare your body for rest. Close your eyes for 30 seconds. Release the tension in your shoulders and jaw. Sleep is when your brain consolidates today's complex formulas. Let's step away from screens and transition into quiet rest."
        return "I hear you. Let's step back from the calculations and schedules for a moment. Feel the ground beneath your feet. Inhale calm, exhale the tension. You are doing enough. Tell me, is there a physical feeling of tension in your body right now?"

    return "I'm here for you. We can work through your exam prep together. Tell me more about what you're studying or how you're coping."

# Secure Remote API Calling
def call_gemini_api(api_key, prompt_text):
    import requests
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt_text}]
        }]
    }
    response = requests.post(url, headers=headers, json=payload, timeout=15)
    if response.status_code != 200:
        raise Exception(f"Gemini API returned status code {response.status_code}: {response.text}")
    
    data = response.json()
    return data['candidates'][0]['content']['parts'][0]['text']

# --- Flask Server Endpoints ---

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_journal():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json() or {}
    text = data.get("text", "")
    exam = data.get("exam", "JEE")

    if not text.strip():
        return jsonify({"error": "No journal text provided"}), 400

    if GEMINI_API_KEY:
        try:
            system_prompt = f"""You are ZenStudy, an expert empathetic AI mental well-being companion for students preparing for high-stakes tests (currently preparing for {exam}).
Analyze the following student daily journal log:
"{text}"

Evaluate the student's level (0 to 100) of:
1. Stress
2. Burnout
3. Self-Doubt

Also provide an empathetic analysis title (e.g. "Coping with Chemistry Mock scores") and a hyper-personalized, contextual coping strategy (under 120 words). Encourage adaptive breathing or motivational strategies.

You MUST respond strictly in the following JSON format:
{{
  "stress": 75,
  "burnout": 60,
  "doubt": 80,
  "feedbackTitle": "Understanding Exam Pressure",
  "feedbackText": "Empathetic tailored strategy here..."
}}"""
            raw_response = call_gemini_api(GEMINI_API_KEY, system_prompt)
            clean_str = raw_response.strip()
            if clean_str.startswith("```"):
                clean_str = re.sub(r'^```json\s*', '', clean_str)
                clean_str = re.sub(r'```$', '', clean_str).strip()
            
            parsed = json.loads(clean_str)
            return jsonify({
                "stress": int(parsed.get("stress", 50)),
                "burnout": int(parsed.get("burnout", 50)),
                "doubt": int(parsed.get("doubt", 50)),
                "feedbackTitle": parsed.get("feedbackTitle", "AI Wellness Reflection"),
                "feedbackText": parsed.get("feedbackText", "Keep moving forward."),
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            })
        except Exception as e:
            # Fallback locally on error so service doesn't drop
            print(f"Gemini API analysis failed: {e}. Falling back locally.")
            return jsonify(analyze_locally(text, exam))
    else:
        # Run local parser
        return jsonify(analyze_locally(text, exam))

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat_companion():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json() or {}
    history = data.get("history", [])
    companion_name = data.get("companionName", "Aria")
    companion_prompt = data.get("companionPrompt", "")
    exam = data.get("exam", "JEE")
    latest_message = data.get("latestUserMessage", "")

    if not latest_message.strip():
        return jsonify({"error": "No user message provided"}), 400

    if GEMINI_API_KEY:
        try:
            history_str = "\n".join([f"{h['sender'].upper()}: {h['text']}" for h in history])
            prompt = f"""You are {companion_name}, a supportive AI chatbot companion for a student preparing for the {exam} exam.
Your profile/role instructions: "{companion_prompt}"
Here is the conversation history:
{history_str}
USER: {latest_message}

Give a warm, personalized, contextual reply (max 100 words). Be empathetic, offer direct coping/focus tips, and ask a supporting follow-up. Do not sound generic."""
            
            reply = call_gemini_api(GEMINI_API_KEY, prompt)
            return jsonify({"reply": reply.strip()})
        except Exception as e:
            print(f"Gemini API chat failed: {e}. Falling back locally.")
            mock_reply = get_local_mock_reply(latest_message, companion_name.lower(), exam)
            return jsonify({"reply": mock_reply})
    else:
        mock_reply = get_local_mock_reply(latest_message, companion_name.lower(), exam)
        return jsonify({"reply": mock_reply})

# --- Serve Static Front-End ---

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Retrieve port from env (Vercel/Render support) or default to 8000
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting ZenStudy server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
