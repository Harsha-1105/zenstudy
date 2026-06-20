/**
 * ZenStudy - Core Application Orchestrator
 * Drives router navigation, handles state sync via localStorage, regulates the global SOS panic sequencer,
 * and enforces security measures (XSS sanitization & Privacy PIN locks).
 * Tracks student wellbeing achievements and focus stats.
 */

// Global XSS Sanitization Helper
window.escapeHTML = function(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });
};

// Global state wrapper
window.AppState = {
    _state: {
        settings: {
            name: "Aarav Sharma",
            exam: "JEE",
            examDate: "", // Computed dynamically on load if empty
            geminiKey: "",
            pinEnabled: false,
            pinHash: ""
        },
        logs: [],
        chats: {
            aria: [],
            leo: [],
            sia: []
        },
        plannerTasks: [],
        achievements: {
            journalCount: 5,
            journalStreak: 3,
            breathCount: 1,
            taskCount: 1, // Start with 1 completed mock task
            sosCount: 0
        }
    },

    init: function() {
        const local = localStorage.getItem('zenstudy_state');
        if (local) {
            try {
                this._state = JSON.parse(local);
                // Backwards compatibility safety checks
                if (this._state.settings.pinEnabled === undefined) {
                    this._state.settings.pinEnabled = false;
                }
                if (this._state.settings.pinHash === undefined) {
                    this._state.settings.pinHash = "";
                }
                if (!this._state.achievements) {
                    this._state.achievements = {
                        journalCount: this._state.logs ? this._state.logs.length : 0,
                        journalStreak: this._state.logs ? Math.min(this._state.logs.length, 3) : 0,
                        breathCount: 1,
                        taskCount: this._state.plannerTasks ? this._state.plannerTasks.filter(t => t.completed).length : 0,
                        sosCount: 0
                    };
                }
                return;
            } catch (e) {
                console.error("Failed to parse local state, re-initializing:", e);
            }
        }

        // Setup default dates & mock records to present an instantly immersive, premium experience
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 10); // Target exam 10 months away
        this._state.settings.examDate = defaultDate.toISOString().split('T')[0];

        // Seed mock journaling history with realistic high-stakes stress fluctuations
        const mockLogs = [
            {
                text: "Started chemistry chapters, feeling completely lost in organic compounds. There is so much backlog. My parents are asking about mock scores.",
                mood: "overwhelmed",
                analysis: {
                    stress: 78,
                    burnout: 62,
                    doubt: 85,
                    feedbackTitle: "Managing Chemistry Backlogs",
                    feedbackText: "It's normal to feel overwhelmed by organic chemistry backlogs. Leo recommends picking one small mechanism today and using the 25-minute Pomodoro method. Steer clear of studying multiple chapters simultaneously.",
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
            },
            {
                text: "Had a good sleep. Studied 6 hours today and attempted mock equations. Got a decent score but still feel anxious about math formulas.",
                mood: "stressed",
                analysis: {
                    stress: 60,
                    burnout: 48,
                    doubt: 55,
                    feedbackTitle: "Math Progress Underway",
                    feedbackText: "You are maintaining steady momentum. Formula retention requires active recall. Sia recommends doing a quick 4-count box breathing exercise before your next mock attempt.",
                    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
                }
            },
            {
                text: "Feeling very tired. Stared at physics papers for three hours but nothing went in. Thinking of taking a break, but I feel guilty if I don't study.",
                mood: "tired",
                analysis: {
                    stress: 72,
                    burnout: 85,
                    doubt: 70,
                    feedbackTitle: "Mitigating Exam Fatigue",
                    feedbackText: "Severe fatigue detected. Do not force studying when your brain is drained; this creates false productivity. Aria suggests an immediate 30-minute screen-free break and a warm tea. Rest is active preparation.",
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            },
            {
                text: "Did box breathing. Revised mechanics notes and scored better. Feel slightly more relaxed today, going to try sleeping earlier.",
                mood: "calm",
                analysis: {
                    stress: 40,
                    burnout: 45,
                    doubt: 35,
                    feedbackTitle: "Calm Mind Momentum",
                    feedbackText: "Excellent self-regulation. Your stress indicators show healthy adjustment. Keep prioritizing early sleep; your brain consolidation happens during REM stages.",
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                }
            },
            {
                text: "Today my mocks results came and they were below my cutoff expectations. Feeling extremely worried that I won't clear JEE. Everyone in class seems way ahead of me.",
                mood: "overwhelmed",
                analysis: {
                    stress: 85,
                    burnout: 70,
                    doubt: 90,
                    feedbackTitle: "Mock Cutoff Panic Reset",
                    feedbackText: "Critical level of self-doubt detected. Comparison is a thief of energy. Focus entirely on your own review. Leo recommends listing three specific physics formulas you missed and studying only those tomorrow morning.",
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            }
        ];
        this._state.logs = mockLogs;

        // Seed planner tasks
        this._state.plannerTasks = [
            { id: 1, title: "Physics Mock Review", desc: "Select 5 incorrect answers in mechanics and resolve them", category: "study", completed: false },
            { id: 2, title: "10 min Box Breathing", desc: "Clear stress fog before afternoon physics block", category: "wellness", completed: true },
            { id: 3, title: "Vibe Check / Daily Journal", desc: "Log today's thoughts and evaluate burnout index", category: "wellness", completed: false },
            { id: 4, title: "Chemistry Formula Block", desc: "Revise organic naming methods for 30 minutes", category: "study", completed: false }
        ];

        // Seed achievements
        this._state.achievements = {
            journalCount: 5,
            journalStreak: 3,
            breathCount: 1,
            taskCount: 1,
            sosCount: 0
        };

        this.save();
    },

    get: function() {
        return this._state;
    },

    save: function() {
        localStorage.setItem('zenstudy_state', JSON.stringify(this._state));
    },

    updateSettings: function(newSettings) {
        this._state.settings = { ...this._state.settings, ...newSettings };
        this.save();
    },

    addLog: function(text, mood, analysis) {
        this._state.logs.push({ text, mood, analysis });
        
        // Update achievements
        this._state.achievements.journalCount++;
        this._state.achievements.journalStreak = Math.min(30, this._state.achievements.journalStreak + 1);
        
        this.save();
    },

    addChatMessage: function(companionId, sender, text) {
        if (!this._state.chats[companionId]) {
            this._state.chats[companionId] = [];
        }
        this._state.chats[companionId].push({
            sender,
            text,
            timestamp: new Date().toISOString()
        });
        this.save();
    },

    togglePlannerTask: function(taskId) {
        const task = this._state.plannerTasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            
            // Update achievement tasks count
            if (task.completed) {
                this._state.achievements.taskCount++;
            } else {
                this._state.achievements.taskCount = Math.max(0, this._state.achievements.taskCount - 1);
            }
            
            this.save();
        }
    },

    incrementBreathCount: function() {
        if (!this._state.achievements) this._state.achievements = {};
        this._state.achievements.breathCount = (this._state.achievements.breathCount || 0) + 1;
        this.save();
    },

    incrementSOSCount: function() {
        if (!this._state.achievements) this._state.achievements = {};
        this._state.achievements.sosCount = (this._state.achievements.sosCount || 0) + 1;
        this.save();
    },

    reset: function() {
        localStorage.removeItem('zenstudy_state');
        this.init();
    },

    // Compute averages for dashboard charts and metrics
    getAverages: function() {
        const logs = this._state.logs;
        if (logs.length === 0) {
            return { stress: 40, burnout: 35, doubt: 30, stressTrend: 0, burnoutTrend: 0, doubtTrend: 0 };
        }

        const latest = logs[logs.length - 1].analysis;
        
        if (logs.length === 1) {
            return {
                stress: latest.stress,
                burnout: latest.burnout,
                doubt: latest.doubt,
                stressTrend: 0,
                burnoutTrend: 0,
                doubtTrend: 0
            };
        }

        // Compare last log to second-to-last log for trending
        const prev = logs[logs.length - 2].analysis;

        return {
            stress: latest.stress,
            burnout: latest.burnout,
            doubt: latest.doubt,
            stressTrend: latest.stress - prev.stress,
            burnoutTrend: latest.burnout - prev.burnout,
            doubtTrend: latest.doubt - prev.doubt
        };
    }
};

// Global routing manager
window.AppRouter = {
    activePage: 'dashboard',

    init: function() {
        // Bind sidebar navigation clicks
        document.querySelectorAll('.nav-item').forEach(button => {
            button.addEventListener('click', () => {
                const targetPage = button.getAttribute('data-page');
                this.navigate(targetPage);
            });
        });

        // Load starting page
        this.navigate(this.activePage);
    },

    navigate: function(pageId) {
        // Disconnect mindfulness breathing if moving away
        if (this.activePage === 'mindfulness' && window.Mindfulness) {
            window.Mindfulness.stopBreathing();
        }

        this.activePage = pageId;

        // Sync visual class states
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.getAttribute('data-page') === pageId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Run component renderers
        switch(pageId) {
            case 'dashboard':
                window.Dashboard.render();
                break;
            case 'journal':
                window.Journal.render();
                break;
            case 'companion':
                window.Companion.render();
                break;
            case 'mindfulness':
                window.Mindfulness.render();
                break;
            case 'settings':
                window.Settings.render();
                break;
            default:
                window.Dashboard.render();
        }
    }
};

// Global SOS Panic Sequencer Modal logic
window.SOSModal = {
    currentStep: 5, // steps down from 5, 4, 3, 2, 1

    init: function() {
        const trigger = document.getElementById('sos-trigger');
        const modal = document.getElementById('sos-modal');
        const closeBtn = document.getElementById('close-sos-modal');
        const nextBtn = document.getElementById('sos-next-btn');
        const prevBtn = document.getElementById('sos-prev-btn');

        if (!trigger || !modal || !closeBtn || !nextBtn || !prevBtn) return;

        trigger.addEventListener('click', () => {
            this.currentStep = 5;
            this.updateStepView();
            modal.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            if (window.Mindfulness && window.AppRouter.activePage === 'mindfulness') {
                window.Mindfulness.resetState();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.updateStepView();
            } else {
                // Complete sequence & register achievement
                modal.classList.add('hidden');
                window.AppState.incrementSOSCount();
                alert("Grounding complete. You are in control. Let's take things one step at a time.");
            }
        });

        prevBtn.addEventListener('click', () => {
            if (this.currentStep < 5) {
                this.currentStep++;
                this.updateStepView();
            }
        });
    },

    updateStepView: function() {
        document.querySelectorAll('.grounding-step').forEach(step => {
            const stepNum = Number(step.getAttribute('data-step'));
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        const prevBtn = document.getElementById('sos-prev-btn');
        const nextBtn = document.getElementById('sos-next-btn');

        if (prevBtn) prevBtn.disabled = (this.currentStep === 5);
        if (nextBtn) {
            nextBtn.textContent = (this.currentStep === 1) ? "Finish & Close" : "Next Step";
        }
    }
};

// Privacy Lock Keypad Module
window.PrivacyLock = {
    enteredPin: "",

    init: function() {
        const screen = document.getElementById('pin-lock-screen');
        const state = window.AppState.get();

        if (!screen) return;

        // Activate Lock Screen if settings dictate
        if (state.settings.pinEnabled && state.settings.pinHash) {
            this.showLock();
        } else {
            this.hideLock();
        }

        // Bind digital keypad clicks
        document.querySelectorAll('.pin-key').forEach(button => {
            button.addEventListener('click', () => {
                const val = button.getAttribute('data-val');
                this.handleKeyPress(val);
            });
        });
    },

    showLock: function() {
        const screen = document.getElementById('pin-lock-screen');
        if (screen) {
            screen.classList.remove('hidden');
            this.enteredPin = "";
            this.updateDots();
            const err = document.getElementById('pin-error-label');
            if (err) err.classList.add('hidden');
        }
    },

    hideLock: function() {
        const screen = document.getElementById('pin-lock-screen');
        if (screen) {
            screen.classList.add('hidden');
        }
    },

    handleKeyPress: function(val) {
        const err = document.getElementById('pin-error-label');
        if (err) err.classList.add('hidden');

        if (val === 'clear') {
            this.enteredPin = "";
            this.updateDots();
        } else if (val === 'back') {
            this.enteredPin = this.enteredPin.slice(0, -1);
            this.updateDots();
        } else {
            if (this.enteredPin.length < 4) {
                this.enteredPin += val;
                this.updateDots();

                if (this.enteredPin.length === 4) {
                    // Check PIN correctness
                    const state = window.AppState.get();
                    if (this.enteredPin === state.settings.pinHash) {
                        this.hideLock();
                    } else {
                        // Error visual feedback
                        if (err) err.classList.remove('hidden');
                        this.enteredPin = "";
                        // Reset dots after slight delay
                        setTimeout(() => this.updateDots(), 300);
                    }
                }
            }
        }
    },

    updateDots: function() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, idx) => {
            if (idx < this.enteredPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }
};

// Start application when DOM is fully prepared
document.addEventListener('DOMContentLoaded', () => {
    window.AppState.init();

    // Set initial sidebar credentials from loaded state
    const state = window.AppState.get();
    const nameDisplay = document.getElementById('profile-name-display');
    const examDisplay = document.getElementById('profile-exam-display');
    const avatarDisplay = document.getElementById('profile-avatar-display');

    if (nameDisplay) nameDisplay.textContent = window.escapeHTML(state.settings.name || "Aarav Sharma");
    if (examDisplay) examDisplay.textContent = `${state.settings.exam || 'JEE'} Aspirant`;
    if (avatarDisplay && state.settings.name) {
        const initials = state.settings.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarDisplay.textContent = initials;
    }

    // Initialize subsystems
    window.AppRouter.init();
    window.SOSModal.init();
    window.PrivacyLock.init();
});
