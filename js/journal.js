/**
 * ZenStudy - Journaling Module
 * Manages daily logs, emoji mood picker, character count, and AI emotional analysis triggers.
 */

window.Journal = {
    selectedMood: 'focused', // Default selected mood

    render: function() {
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const html = `
            <div class="header-wrapper">
                <div class="welcome-section">
                    <h1>Daily Well-being Log</h1>
                    <p>Pour out your thoughts, track your moods, and unlock personalized AI mental metrics.</p>
                </div>
            </div>

            <div class="journal-layout">
                <!-- Left: Entry Card -->
                <div class="card journal-entry-card">
                    <div class="journal-header">
                        <h2>How are you feeling today?</h2>
                        <span class="date-badge">${todayStr}</span>
                    </div>

                    <!-- Mood Picker -->
                    <div>
                        <div class="mood-picker-label">Select your core emotional state:</div>
                        <div class="mood-grid">
                            <button class="mood-btn ${this.selectedMood === 'overwhelmed' ? 'selected' : ''}" onclick="window.Journal.selectMood('overwhelmed', this)" aria-label="Feeling Overwhelmed">
                                <span class="mood-emoji">😞</span>
                                <span class="mood-name">Overwhelmed</span>
                            </button>
                            <button class="mood-btn ${this.selectedMood === 'stressed' ? 'selected' : ''}" onclick="window.Journal.selectMood('stressed', this)" aria-label="Feeling Stressed">
                                <span class="mood-emoji">😟</span>
                                <span class="mood-name">Stressed</span>
                            </button>
                            <button class="mood-btn ${this.selectedMood === 'tired' ? 'selected' : ''}" onclick="window.Journal.selectMood('tired', this)" aria-label="Feeling Tired">
                                <span class="mood-emoji">😐</span>
                                <span class="mood-name">Tired</span>
                            </button>
                            <button class="mood-btn ${this.selectedMood === 'focused' ? 'selected' : ''}" onclick="window.Journal.selectMood('focused', this)" aria-label="Feeling Focused">
                                <span class="mood-emoji">🙂</span>
                                <span class="mood-name">Focused</span>
                            </button>
                            <button class="mood-btn ${this.selectedMood === 'calm' ? 'selected' : ''}" onclick="window.Journal.selectMood('calm', this)" aria-label="Feeling Calm">
                                <span class="mood-emoji">🧘</span>
                                <span class="mood-name">Calm</span>
                            </button>
                        </div>
                    </div>

                    <!-- Open-Ended Journal Area -->
                    <div class="textarea-wrapper">
                        <textarea 
                            id="journal-input" 
                            class="journal-textarea" 
                            placeholder="Write about your study blocks, mock tests, concerns, backlogs, sleep quality, or general feelings..."
                            oninput="window.Journal.updateWordCount()"></textarea>
                    </div>

                    <div class="journal-footer">
                        <span class="char-counter" id="journal-word-count">0 words</span>
                        <button class="btn btn-primary" id="analyze-journal-btn" onclick="window.Journal.analyzeEntry()">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            Analyze with GenAI
                        </button>
                    </div>
                </div>

                <!-- Right: AI Feedback Panel -->
                <div class="card journal-analysis-card" id="analysis-panel">
                    <div class="analysis-placeholder">
                        <svg class="analysis-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 12 17.19 16.5 19.79"></polyline>
                            <polyline points="7.5 12 12 14.6 16.5 12"></polyline>
                        </svg>
                        <h3>Waiting for analysis</h3>
                        <p>Write your open daily thoughts and click 'Analyze with GenAI' to unlock cognitive metrics.</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;
        this.selectedMood = 'focused'; // Reset state
    },

    selectMood: function(mood, element) {
        this.selectedMood = mood;
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        element.classList.add('selected');
    },

    updateWordCount: function() {
        const textarea = document.getElementById('journal-input');
        const countDisplay = document.getElementById('journal-word-count');
        if (!textarea || !countDisplay) return;

        const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0);
        countDisplay.textContent = `${words.length} words`;
    },

    analyzeEntry: async function() {
        const textarea = document.getElementById('journal-input');
        const btn = document.getElementById('analyze-journal-btn');
        const panel = document.getElementById('analysis-panel');
        
        if (!textarea || !textarea.value.trim()) {
            alert("Please type something in your journal log before running the well-being analysis.");
            return;
        }

        const logText = textarea.value;
        btn.disabled = true;
        btn.innerHTML = `<span class="typing-indicator" style="padding:0;"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span> Analyzing...`;

        // Render visual loading state in panel
        panel.innerHTML = `
            <div class="analysis-placeholder">
                <div class="typing-indicator" style="margin-bottom:1.5rem;">
                    <span class="typing-dot" style="width:12px; height:12px; background:var(--accent-purple);"></span>
                    <span class="typing-dot" style="width:12px; height:12px; background:var(--accent-cyan);"></span>
                    <span class="typing-dot" style="width:12px; height:12px; background:var(--accent-rose);"></span>
                </div>
                <h3>GenAI reflecting on your log</h3>
                <p style="max-width:240px">Analyzing stressful triggers, emotional fatigue indexes, and academic doubts...</p>
            </div>
        `;

        const state = window.AppState.get();
        const examName = state.settings.exam || "JEE";
        const apiKey = state.settings.geminiKey;
        const backendUrl = state.settings.backendUrl;

        let analysisResult;

        try {
            if (apiKey || backendUrl) {
                // Query actual Gemini model
                analysisResult = await window.AIEngine.analyzeWithGemini(apiKey, logText, examName);
            } else {
                // Fallback to local heuristic parsing after simulated delay for dramatic effect
                await new Promise(resolve => setTimeout(resolve, 1500));
                analysisResult = window.AIEngine.analyzeLocally(logText, examName);
            }

            // Save log to AppState
            window.AppState.addLog(logText, this.selectedMood, analysisResult);

            // Render Results in panel
            this.renderAnalysisResult(analysisResult);
            
            // Clear textarea
            textarea.value = '';
            this.updateWordCount();
            
            // Re-enable button
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Analyze with GenAI
            `;

        } catch (error) {
            console.error("Analysis failed:", error);
            panel.innerHTML = `
                <div class="analysis-placeholder" style="color:var(--accent-rose)">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <h3 style="margin-top:1rem;">API Analysis Error</h3>
                    <p style="color:var(--text-secondary); margin-top:0.5rem; max-width:280px;">${window.escapeHTML(error.message || "Failed to analyze text. Please check your Gemini API key in settings or try local analysis.")}</p>
                    <button class="btn btn-secondary" style="margin-top:1.5rem" onclick="window.Journal.render()">Retry</button>
                </div>
            `;
            btn.disabled = false;
            btn.innerHTML = `Analyze with GenAI`;
        }
    },

    renderAnalysisResult: function(result) {
        const panel = document.getElementById('analysis-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="analysis-results">
                <div class="analysis-header">
                    <div class="analysis-title-bar">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline></svg>
                        <h3>${window.escapeHTML(result.feedbackTitle)}</h3>
                    </div>
                    <div class="analysis-subtitle">Calculated based on daily log keywords and expressions</div>
                </div>

                <div class="ai-gauges">
                    <div class="gauge-item">
                        <div class="gauge-labels">
                            <span class="gauge-name">Stress Level</span>
                            <span class="gauge-val" style="color: var(--accent-rose)">${result.stress}%</span>
                        </div>
                        <div class="gauge-track">
                            <div class="gauge-fill stress" style="width: ${result.stress}%"></div>
                        </div>
                    </div>

                    <div class="gauge-item">
                        <div class="gauge-labels">
                            <span class="gauge-name">Burnout Risk</span>
                            <span class="gauge-val" style="color: var(--accent-amber)">${result.burnout}%</span>
                        </div>
                        <div class="gauge-track">
                            <div class="gauge-fill burnout" style="width: ${result.burnout}%"></div>
                        </div>
                    </div>

                    <div class="gauge-item">
                        <div class="gauge-labels">
                            <span class="gauge-name">Self-Doubt</span>
                            <span class="gauge-val" style="color: var(--accent-cyan)">${result.doubt}%</span>
                        </div>
                        <div class="gauge-track">
                            <div class="gauge-fill doubt" style="width: ${result.doubt}%"></div>
                        </div>
                    </div>
                </div>

                <div class="ai-feedback-box">
                    <div class="ai-feedback-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div class="ai-feedback-text">
                        <h4>Tailored Coping Strategy</h4>
                        <p>${window.escapeHTML(result.feedbackText)}</p>
                    </div>
                </div>
            </div>
        `;
    }
};
