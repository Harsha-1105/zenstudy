/**
 * ZenStudy - Chat Companion Module
 * Empathy-driven digital companion chat with selectable personalities.
 */

window.Companion = {
    selectedCompanion: 'aria', // Default companion ID

    companions: {
        aria: {
            name: "Aria",
            role: "The Gentle Encourager",
            avatar: "🌸",
            theme: "aria",
            welcome: "Hey, take a deep breath. I'm Aria, your mental wellness companion. High-stakes prep is tough, but you are tougher. Feel free to vent or share what's on your mind. I'm right here to support you.",
            prompt: "You are Aria, a gentle, highly empathetic wellness mentor. Speak with kindness and reassurance. Focus on self-compassion, mental decompression, and emotional support."
        },
        leo: {
            name: "Leo",
            role: "The Focus Coach",
            avatar: "⚡",
            theme: "leo",
            welcome: "Hey! Leo here. Let's tackle that stress with action. Backlogs, complex equations, or mock tests piling up? Tell me what's blocking you, and we'll break it down into tiny, actionable Pomodoro tasks. We've got this.",
            prompt: "You are Leo, a dynamic and encouraging study planner. Speak with motivating, high-energy coaching vibes. Focus on task management, breaking down goals, and active planning."
        },
        sia: {
            name: "Sia",
            role: "The Mindful Guide",
            avatar: "🌌",
            theme: "sia",
            welcome: "Welcome. I am Sia. In the noise of formulas and mock rankings, let's find a quiet space for your mind. A calm brain retains information twice as fast. Tell me, how does your breathing feel right now?",
            prompt: "You are Sia, a zen mindfulness practitioner. Speak with serenity and slow-paced clarity. Focus on grounding exercises, somatic awareness, perspective shift, and breathing pacing."
        }
    },

    render: function() {
        const state = window.AppState.get();
        const activeComp = this.companions[this.selectedCompanion];
        
        // Load chat history from app state
        const history = state.chats[this.selectedCompanion] || [];

        let optionsHtml = '';
        Object.keys(this.companions).forEach(key => {
            const comp = this.companions[key];
            optionsHtml += `
                <div class="companion-option ${this.selectedCompanion === key ? 'selected' : ''}" 
                     onclick="window.Companion.switchCompanion('${key}')"
                     role="button" aria-label="Select companion ${comp.name}">
                    <div class="companion-avatar-circle ${comp.theme}">
                        ${comp.avatar}
                        <span class="online-dot"></span>
                    </div>
                    <div class="companion-opt-info">
                        <div class="companion-opt-name">${comp.name}</div>
                        <div class="companion-opt-desc">${comp.role}</div>
                    </div>
                </div>
            `;
        });

        const html = `
            <div class="header-wrapper" style="margin-bottom: 1.5rem;">
                <div class="welcome-section">
                    <h1>ZenAI Companion Chat</h1>
                    <p>Have a quick conversation with your digital support squad to calm your mind or organize study logs.</p>
                </div>
            </div>

            <div class="companion-layout">
                <!-- Left: Selector -->
                <div class="card companion-selector-card">
                    <div class="companion-selector-title">Select Companion</div>
                    ${optionsHtml}
                </div>

                <!-- Right: Active Chat Frame -->
                <div class="card chat-card">
                    <div class="chat-header-bar">
                        <div class="companion-avatar-circle ${activeComp.theme}" style="width:40px; height:40px; font-size:1.15rem;">
                            ${activeComp.avatar}
                        </div>
                        <div>
                            <div class="active-companion-name">${activeComp.name}</div>
                            <div class="active-companion-role">${activeComp.role}</div>
                        </div>
                    </div>

                    <div class="chat-history" id="chat-history-container">
                        <!-- Messages injected here -->
                    </div>

                    <div class="chat-input-bar">
                        <input type="text" id="chat-text-input" class="chat-input" 
                               placeholder="Message ${activeComp.name}..." 
                               onkeydown="if(event.key === 'Enter') window.Companion.sendMessage()" />
                        <button class="btn btn-primary" onclick="window.Companion.sendMessage()" aria-label="Send message">Send</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;
        this.renderMessages();
    },

    switchCompanion: function(companionId) {
        this.selectedCompanion = companionId;
        this.render();
    },

    renderMessages: function() {
        const container = document.getElementById('chat-history-container');
        if (!container) return;

        const state = window.AppState.get();
        const activeComp = this.companions[this.selectedCompanion];
        const history = state.chats[this.selectedCompanion] || [];

        let html = '';
        
        // Always render default greeting first if no history
        if (history.length === 0) {
            html += `
                <div class="chat-bubble assistant">
                    <div class="bubble-avatar ${activeComp.theme}">${activeComp.avatar}</div>
                    <div class="bubble-content">
                        <p>${activeComp.welcome}</p>
                    </div>
                </div>
            `;
        } else {
            history.forEach(msg => {
                const isUser = msg.sender === 'user';
                html += `
                    <div class="chat-bubble ${isUser ? 'user' : 'assistant'}">
                        <div class="bubble-avatar ${isUser ? '' : activeComp.theme}">${isUser ? '👤' : activeComp.avatar}</div>
                        <div class="bubble-content">
                            <p>${window.escapeHTML(msg.text)}</p>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    },

    sendMessage: async function() {
        const input = document.getElementById('chat-text-input');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        // Add user message to state
        window.AppState.addChatMessage(this.selectedCompanion, 'user', text);
        this.renderMessages();

        // Show typing indicator
        const container = document.getElementById('chat-history-container');
        const activeComp = this.companions[this.selectedCompanion];
        
        const typingBubble = document.createElement('div');
        typingBubble.className = "chat-bubble assistant";
        typingBubble.id = "chat-typing-indicator";
        typingBubble.innerHTML = `
            <div class="bubble-avatar ${activeComp.theme}">${activeComp.avatar}</div>
            <div class="bubble-content" style="padding:0.6rem 1rem;">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        container.appendChild(typingBubble);
        container.scrollTop = container.scrollHeight;

        // Resolve response
        const state = window.AppState.get();
        const exam = state.settings.exam || "JEE";
        const apiKey = state.settings.geminiKey;
        const history = state.chats[this.selectedCompanion] || [];

        let replyText = "";

        try {
            if (apiKey) {
                // Call Gemini Live API
                replyText = await window.AIEngine.getCompanionChat(
                    apiKey, 
                    history.slice(-10), // Limit history length context
                    activeComp.name, 
                    activeComp.prompt, 
                    exam, 
                    text
                );
            } else {
                // Mock smart response locally
                await new Promise(resolve => setTimeout(resolve, 1000));
                replyText = this.generateLocalMockReply(text, this.selectedCompanion, exam);
            }

            // Remove typing bubble
            const tb = document.getElementById('chat-typing-indicator');
            if (tb) tb.remove();

            // Add response to state and re-render
            window.AppState.addChatMessage(this.selectedCompanion, 'assistant', replyText);
            this.renderMessages();

        } catch (error) {
            console.error("Companion reply failed:", error);
            const tb = document.getElementById('chat-typing-indicator');
            if (tb) tb.remove();

            window.AppState.addChatMessage(this.selectedCompanion, 'assistant', "Sorry, my neural connection was disrupted. Please check your network or API settings.");
            this.renderMessages();
        }
    },

    /**
     * Local Context-Aware Mock Generator for offline use
     */
    generateLocalMockReply: function(text, companionId, exam) {
        const msg = text.toLowerCase();

        // 1. Generic emergency check
        if (msg.includes('die') || msg.includes('kill myself') || msg.includes('suicide') || msg.includes('give up completely')) {
            return "Please know that your life is extremely valuable. Competitive tests are just events, not a final measure of your potential. If you're feeling completely overwhelmed, please talk to a parent, friend, or call a helpline. I recommend using the 'SOS Grounding' button in the sidebar right now to help center your thoughts.";
        }

        // Contextual trigger words
        const isFail = msg.includes('fail') || msg.includes('score') || msg.includes('marks') || msg.includes('mock') || msg.includes('rank') || msg.includes('percentile');
        const isBacklog = msg.includes('backlog') || msg.includes('syllabus') || msg.includes('behind') || msg.includes('chapters') || msg.includes('physics') || msg.includes('chemistry') || msg.includes('maths') || msg.includes('biology');
        const isParents = msg.includes('parent') || msg.includes('dad') || msg.includes('mom') || msg.includes('family') || msg.includes('expect');
        const isSleep = msg.includes('sleep') || msg.includes('tired') || msg.includes('exhausted') || msg.includes('insomnia') || msg.includes('night');

        // Character: Aria (Empathetic Encourager)
        if (companionId === 'aria') {
            if (isFail) {
                return `I understand how hurtful it is to score lower than expected on mock tests. Mock scores are diagnostic tools, not predictions of your actual ${exam} result. Give yourself permission to make mistakes. How about we skip mock reviews for the rest of today and do a gentle topic revision instead?`;
            }
            if (isBacklog) {
                return `It's completely normal to feel overwhelmed by the vast ${exam} syllabus. A backlog is just an unread chapter, it doesn't define your capacity. Let's breathe. You don't have to cover everything today. Just focus on one simple concept. I'm rooting for you.`;
            }
            if (isParents) {
                return `Family expectations can weigh so heavily on top of your own academic pressure. Parents often worry because they want the best for you, though it feels like pressure. Try writing down your feelings or having a gentle cup of tea. Your worth is much larger than a test mark.`;
            }
            if (isSleep) {
                return "Rest is a critical part of study stamina! Pushing through midnight fatigue causes memory drop-offs. Please prioritize sleep tonight. Can we agree to close the books by 10:30 PM today and rest? Your brain needs it.";
            }
            return `Thank you for sharing that with me. Academic pressure is a massive challenge, especially with ${exam}. Please remember to be gentle with yourself. You are making progress, even when it feels slow. What's one positive thing, no matter how small, that happened today?`;
        }

        // Character: Leo (Focus Coach)
        if (companionId === 'leo') {
            if (isFail) {
                return `Mock scores are raw data, nothing else! They highlight weak chapters so you can patch them before the real ${exam} exam. Let's do this: list the top 3 question types you got wrong. That is our study blueprint for tomorrow. Don't look back, focus on the review!`;
            }
            if (isBacklog) {
                return `Let's tackle this backlog systematically. Trying to study the whole backlog at once causes paralysis. Pick ONE chapter. Set a Pomodoro timer for 25 minutes. Study only that. We are going to build consistency step by step. What chapter are we picking?`;
            }
            if (isParents) {
                return `Pressure from expectation is a distraction. Let's channel that energy directly into execution. Control the controllable: your schedule, your active recall, your breaks. Write down a 2-hour clear focus block for today, and let's get it done.`;
            }
            if (isSleep) {
                return "Sleep is a high-performance cheat code! Sleep deprivation ruins active memory recall. If you are exhausted, study productivity drops to zero. Close the books. Get 7 hours of high-quality sleep tonight, and let's crush the morning block with full energy!";
            }
            return `Got it. Let's make an action plan. What is the single highest-yield topic on your ${exam} syllabus that you can study for 30 minutes right now? Let's write down a clear objective, start a timer, and clear it off the board.`;
        }

        // Character: Sia (Mindful Guide)
        if (companionId === 'sia') {
            if (isFail) {
                return `When we look at scoreboards, our thoughts fly into the anxious future. Let's bring them back to the current breath. A mock score is a transient event. Inhale deeply... hold... and release. You are not your scores. You are here, breathing and learning.`;
            }
            if (isBacklog) {
                return `A mountain of chapters looks overwhelming from the bottom. Focus only on the step right under your foot. You don't have to carry the whole ${exam} syllabus in your mind. Breathe in space, let go of the pressure. Just read one paragraph with calm awareness.`;
            }
            if (isParents) {
                return `Expectations create ripples of anxiety in our quiet spaces. Recognize that their expectations are external, and your peace is internal. Allow yourself to release their expectations on the exhale. You are doing your best.`;
            }
            if (isSleep) {
                return "Let's prepare your body for rest. Close your eyes for 30 seconds. Release the tension in your shoulders and jaw. Sleep is when your brain consolidates today's complex formulas. Let's step away from screens and transition into quiet rest.";
            }
            return `I hear you. Let's step back from the calculations and schedules for a moment. Feel the ground beneath your feet. Inhale calm, exhale the tension. You are doing enough. Tell me, is there a physical feeling of tension in your body right now?`;
        }

        return "I'm here for you. We can work through your exam prep together. Tell me more about what you're studying or how you're coping.";
    }
};
