# ZenStudy 🌸
> **AI-Powered Exam Wellness & Stress Companion for Competitive Test Aspirants**

ZenStudy is a generative AI-powered web application built specifically for students preparing for high-stakes board exams and competitive entrance tests (such as **JEE, NEET, GATE, CAT, and CUET**). It balances academic execution with mental recovery, helping students monitor stress, prevent burnout, and manage self-doubt.

---

## 🌟 Core Features

*   **✍️ AI-Powered Daily Journaling**: A safe writing space that analyzes open-ended diaries for Stress, Burnout, and Self-Doubt markers using contextual sentiment algorithms.
*   **📊 Well-being Index & SVG Charts**: Dynamic, interactive, responsive SVG line graphs tracking mental trends and task completion rates over time.
*   **💬 ZenAI Chat Companion**: Choose from three distinct digital support squad companions:
    *   **Aria (The Gentle Encourager)**: Focuses on kind decompression and self-compassion.
    *   **Leo (The Focus Coach)**: Action-oriented study organizer specializing in backlog management and Pomodoro task boards.
    *   **Sia (The Mindful Guide)**: Leads slow-paced grounding, breathing, and somatic calm.
*   **🧘 Mindful Zone (Visual Pacer)**: A glowing breathing bubble that expands/contracts with guided pacing (supporting Equal Focus, Box Breathing, and 4-7-8 Deep Relaxation techniques).
*   **🛡️ SOS Grounding (5-4-3-2-1 Sequencer)**: An emergency calm-down modal that breaks panic/anxiety loops by redirecting sensory focus back to the present.
*   **🏆 Milestone Achievements Board**: Gamified achievements (e.g., *Focus Scholar, Zen Master, Self-Reflector*) that reward healthy study-wellness habits with badges and progress trackers.
*   **🔒 Local Privacy PIN Lock**: An optional 4-digit keypad overlay to shield sensitive mental well-being journals on shared household devices.

---

## 🔒 Security Architecture

1.  **Strict XSS Defenses**: All student-provided inputs (journal logs, chat text, task titles, names) are parsed through a central HTML escaping layer before dynamic template injections.
2.  **API Key Safety**: User-supplied Gemini keys are masked inside password fields, stored strictly locally on the client's device, and never logged or exposed in stack error popups.
3.  **Local Storage Privacy**: Sensitive journal logs and chat logs reside entirely inside browser `localStorage` under origin-scoped namespaces.

---

## 🛠️ Technology Stack

*   **Frontend Structure**: Semantic HTML5
*   **Design & Styling**: Custom Vanilla CSS3 (Space-dark theme, Glassmorphic cards, Glowing neon accents, and responsive layout grids)
*   **Application Logic**: JavaScript (Modular SPA routing, local storage synchronizations, SVG chart builders)
*   **AI Integration**: Hybrid (Client-side offline parsing + direct secure connector to the **Google Gemini 1.5 Flash** endpoint via HTTPS)
*   **Server Environment**: Python 3.x (Local HTTP server)

---

## 🚀 Getting Started & Local Setup

### Prerequisite
Make sure you have **Python 3** installed on your system.

### 1. Run the Project Locally
Clone or open the project folder in your terminal and run:
```bash
# Start the local server
python -m http.server 8000
```
Open your web browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

### 2. Configure Advanced GenAI (Optional)
By default, ZenStudy operates offline using a keyword-association parser. To unlock live LLM-generated emotional evaluations:
1.  Go to **Settings** in the ZenStudy sidebar.
2.  Paste your **Google Gemini API Key** (starting with `AIzaSy...`).
3.  Click **Save Changes**.

### 3. Setting Up the Privacy PIN
1.  Navigate to **Settings** and toggle **Enable Privacy PIN Lock**.
2.  Input a **4-digit numeric code** (e.g., `1234`) and click Save.
3.  Reload the browser tab to test the keypad block.

---

## 📂 Codebase File Structure
*   `index.html` — Base layout shell, SVG frameworks, and SOS grounding panels.
*   `styles.css` — Global styles, glassmorphic system design tokens, keypad structures, and bubble pacing animations.
*   `app.js` — Core router, storage state coordinator, XSS escaping, and PIN keypad logic.
*   `js/`
    *   `aiEngine.js` — Sentiment calculation logic and Gemini API HTTPS fetch requests.
    *   `dashboard.js` — Wellness score calculations, SVGs, count downs, and badge render loops.
    *   `journal.js` — Word counters, emoji logs, and analysis panels.
    *   `companion.js` — Digital characters, local mock responses, and conversation bubbles.
    *   `mindfulness.js` — Breathing timers (Equal, Box, 4-7-8) controlling the bubble animation.
    *   `settings.js` — Exam toggles, target calendar dates, and security inputs.
