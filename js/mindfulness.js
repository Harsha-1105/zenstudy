/**
 * ZenStudy - Mindfulness Zone Module
 * Handles breathing pacer loops, animation pacing, and pattern selectors.
 */

window.Mindfulness = {
    timerId: null,
    isBreathing: false,
    selectedPattern: 'equal', // 'equal', 'box', 'relax'

    patterns: {
        equal: {
            name: "Equal Focus Breathing",
            desc: "Equal duration for inhalation and exhalation. Perfect for clearing brain fog and balancing mock test jitters.",
            timing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0 },
            label: "4-4 Pattern"
        },
        box: {
            name: "Box Breathing (Navy SEALs Style)",
            desc: "Used by elite performers to reset the nervous system under intense pressure. Excellent before launching an exam paper.",
            timing: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
            label: "4-4-4-4 Pattern"
        },
        relax: {
            name: "4-7-8 Deep Relaxation",
            desc: "A natural tranquilizer for the nervous system. Highly recommended for exam insomnia, bedtime, or severe burnout states.",
            timing: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
            label: "4-7-8 Pattern"
        }
    },

    render: function() {
        const html = `
            <div class="header-wrapper">
                <div class="welcome-section">
                    <h1>Mindful Zone</h1>
                    <p>Calm your heart rate, lower cortisol, and reset your active memory circuits.</p>
                </div>
            </div>

            <div class="mindful-layout">
                <!-- Left: Pacer Bubble Card -->
                <div class="card breathing-card">
                    <div class="breathing-pacer-container">
                        <div class="breathing-outer-ring"></div>
                        <div class="breathing-bubble exhale" id="breathing-bubble-element">
                            Breathe
                        </div>
                    </div>

                    <div class="breathing-instruction-box">
                        <div class="breathing-instruction" id="breathing-prompt">Ready to begin?</div>
                        <div class="breathing-sub-instruction" id="breathing-countdown">Select a pattern and press Start</div>
                    </div>

                    <div class="breathing-controls">
                        <button class="btn btn-calm" id="breathe-start-btn" onclick="window.Mindfulness.toggleBreathing()">Start Session</button>
                    </div>
                </div>

                <!-- Right: Pattern Option List -->
                <div class="card breathing-options-card">
                    <h2>Select Breathing Pattern</h2>
                    <p class="card-subtitle" style="margin-bottom: 0.5rem;">Adaptive exercises targeted for academic stress relief.</p>
                    
                    <div class="breathe-pattern-option ${this.selectedPattern === 'equal' ? 'selected' : ''}" 
                         onclick="window.Mindfulness.selectPattern('equal')" role="button" aria-label="Select Equal Focus Breathing">
                        <h3>Equal Breathing <span class="pattern-timing-tag">${this.patterns.equal.label}</span></h3>
                        <p>${this.patterns.equal.desc}</p>
                    </div>

                    <div class="breathe-pattern-option ${this.selectedPattern === 'box' ? 'selected' : ''}" 
                         onclick="window.Mindfulness.selectPattern('box')" role="button" aria-label="Select Box Breathing">
                        <h3>Box Breathing <span class="pattern-timing-tag">${this.patterns.box.label}</span></h3>
                        <p>${this.patterns.box.desc}</p>
                    </div>

                    <div class="breathe-pattern-option ${this.selectedPattern === 'relax' ? 'selected' : ''}" 
                         onclick="window.Mindfulness.selectPattern('relax')" role="button" aria-label="Select 4-7-8 Deep Relaxation">
                        <h3>4-7-8 Relaxation <span class="pattern-timing-tag">${this.patterns.relax.label}</span></h3>
                        <p>${this.patterns.relax.desc}</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;
        this.resetState();
    },

    selectPattern: function(patternId) {
        if (this.isBreathing) {
            this.stopBreathing();
        }
        this.selectedPattern = patternId;
        this.render();
    },

    resetState: function() {
        this.isBreathing = false;
        this.timerId = null;
    },

    toggleBreathing: function() {
        const btn = document.getElementById('breathe-start-btn');
        if (!btn) return;

        if (this.isBreathing) {
            this.stopBreathing();
            btn.textContent = "Start Session";
            btn.className = "btn btn-calm";
        } else {
            this.startBreathing();
            btn.textContent = "Stop Session";
            btn.className = "btn btn-secondary";
        }
    },

    startBreathing: function() {
        this.isBreathing = true;
        if (window.AppState) {
            window.AppState.incrementBreathCount();
        }
        const pattern = this.patterns[this.selectedPattern];
        const bubble = document.getElementById('breathing-bubble-element');
        const prompt = document.getElementById('breathing-prompt');
        const countdown = document.getElementById('breathing-countdown');

        if (!bubble || !prompt || !countdown) return;

        let currentPhase = 'inhale'; // phases: inhale, hold1, exhale, hold2
        let secondsLeft = pattern.timing.inhale;

        const runCycle = () => {
            if (!this.isBreathing) return;

            // Handle transition states
            if (secondsLeft <= 0) {
                if (currentPhase === 'inhale') {
                    if (pattern.timing.hold1 > 0) {
                        currentPhase = 'hold1';
                        secondsLeft = pattern.timing.hold1;
                    } else {
                        currentPhase = 'exhale';
                        secondsLeft = pattern.timing.exhale;
                    }
                } else if (currentPhase === 'hold1') {
                    currentPhase = 'exhale';
                    secondsLeft = pattern.timing.exhale;
                } else if (currentPhase === 'exhale') {
                    if (pattern.timing.hold2 > 0) {
                        currentPhase = 'hold2';
                        secondsLeft = pattern.timing.hold2;
                    } else {
                        currentPhase = 'inhale';
                        secondsLeft = pattern.timing.inhale;
                    }
                } else if (currentPhase === 'hold2') {
                    currentPhase = 'inhale';
                    secondsLeft = pattern.timing.inhale;
                }
            }

            // Apply styles based on phase
            if (currentPhase === 'inhale') {
                prompt.textContent = "Inhale...";
                prompt.style.color = "var(--accent-purple)";
                bubble.className = "breathing-bubble inhale";
                bubble.textContent = "Expand";
            } else if (currentPhase === 'hold1' || currentPhase === 'hold2') {
                prompt.textContent = "Hold Breath...";
                prompt.style.color = "var(--accent-amber)";
                bubble.textContent = "Hold";
                // Keep scale depending on context
                if (currentPhase === 'hold1') {
                    bubble.className = "breathing-bubble inhale"; // kept big
                } else {
                    bubble.className = "breathing-bubble exhale"; // kept small
                }
            } else if (currentPhase === 'exhale') {
                prompt.textContent = "Exhale...";
                prompt.style.color = "var(--accent-cyan)";
                bubble.className = "breathing-bubble exhale";
                bubble.textContent = "Contract";
            }

            countdown.textContent = `${secondsLeft}s remaining`;
            secondsLeft--;

            this.timerId = setTimeout(runCycle, 1000);
        };

        runCycle();
    },

    stopBreathing: function() {
        this.isBreathing = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        
        const bubble = document.getElementById('breathing-bubble-element');
        const prompt = document.getElementById('breathing-prompt');
        const countdown = document.getElementById('breathing-countdown');

        if (bubble) {
            bubble.className = "breathing-bubble exhale";
            bubble.textContent = "Breathe";
        }
        if (prompt) prompt.textContent = "Session Stopped";
        if (countdown) countdown.textContent = "Select a pattern and press Start";
    }
};
