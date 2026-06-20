/**
 * ZenStudy - Dashboard Module
 * Handles displaying student metrics, countdowns, schedules, and custom SVG line charts.
 */

window.Dashboard = {
    render: function() {
        const state = window.AppState.get();
        const examName = state.settings.exam || "JEE";
        const targetDate = state.settings.examDate ? new Date(state.settings.examDate) : new Date(new Date().getFullYear() + 1, 4, 5); // default next May
        
        // Calculate days remaining
        const diffTime = targetDate - new Date();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // Get average scores from logs
        const averages = window.AppState.getAverages();
        
        // Determine wellness rating based on scores (higher stress/burnout = lower wellness)
        const wellnessScore = Math.max(10, Math.round(100 - (averages.stress * 0.4 + averages.burnout * 0.4 + averages.doubt * 0.2)));
        
        let wellnessDesc = "Balanced Mindset";
        let wellnessAction = "Keep maintaining your balanced study routine.";
        
        if (wellnessScore < 45) {
            wellnessDesc = "High Burnout Risk";
            wellnessAction = "Critical stress levels. Please activate the SOS calmer or talk to Aria in ZenAI Chat.";
        } else if (wellnessScore < 70) {
            wellnessDesc = "Moderate Pressure";
            wellnessAction = "Try Scheduling a 10 min breathing break after your next study block.";
        }

        // Achievement Metrics calculations
        const ach = state.achievements || { journalCount: 0, journalStreak: 0, breathCount: 0, taskCount: 0, sosCount: 0 };
        const focusMins = (ach.taskCount || 0) * 45;

        // Badge list definitions
        const badges = [
            { id: "scholar", title: "Focus Scholar", desc: "Complete 3 study planner tasks", icon: "🎓", current: ach.taskCount || 0, target: 3 },
            { id: "zen", title: "Zen Master", desc: "Complete 3 breathing exercises", icon: "🧘", current: ach.breathCount || 0, target: 3 },
            { id: "reflector", title: "Self-Reflector", desc: "Write 3 daily journal entries", icon: "✍️", current: ach.journalCount || 0, target: 3 },
            { id: "stopper", title: "Panic Stopper", desc: "Run the emergency SOS calmer once", icon: "🛡️", current: ach.sosCount || 0, target: 1 },
            { id: "streak", title: "Consistency Spark", desc: "Reach a 3-day reflection streak", icon: "🔥", current: ach.journalStreak || 0, target: 3 }
        ];

        let unlockedCount = 0;
        let badgesHtml = '';

        badges.forEach(b => {
            const isUnlocked = b.current >= b.target;
            if (isUnlocked) unlockedCount++;
            const progressPercent = Math.min(100, Math.round((b.current / b.target) * 100));

            badgesHtml += `
                <div class="achievement-item">
                    <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}" title="${isUnlocked ? 'Unlocked!' : 'Locked'}">
                        ${isUnlocked ? b.icon : '🔒'}
                    </div>
                    <div class="achievement-details">
                        <div class="achievement-header-line">
                            <h4 style="color: ${isUnlocked ? '#ffffff' : 'var(--text-secondary)'}">${b.title}</h4>
                            <span class="achievement-ratio">${b.current}/${b.target}</span>
                        </div>
                        <p class="achievement-desc">${b.desc}</p>
                        <div class="achievement-progress-track">
                            <div class="achievement-progress-fill" style="width: ${progressPercent}%; background: ${isUnlocked ? 'var(--accent-cyan)' : 'var(--accent-purple)'}"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        const html = `
            <div class="header-wrapper">
                <div class="welcome-section">
                    <h1>Welcome back, ${window.escapeHTML(state.settings.name || "Student")}</h1>
                    <div class="dashboard-stats-strip">
                        <span class="stats-strip-item">🔥 <strong>${ach.journalStreak} Day</strong> Streak</span>
                        <span class="stats-strip-item">⏱️ <strong>${focusMins}m</strong> Focus Time</span>
                        <span class="stats-strip-item">🏆 <strong>${unlockedCount}/${badges.length}</strong> Badges</span>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="window.AppRouter.navigate('journal')">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Write Journal
                    </button>
                    <button class="btn btn-calm" onclick="window.AppRouter.navigate('mindfulness')">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path></svg>
                        Breathe Zone
                    </button>
                </div>
            </div>

            <!-- Top Grid -->
            <div class="dashboard-grid">
                <!-- Wellness Score Ring -->
                <div class="card wellness-summary-card">
                    <div>
                        <h2>Well-being Index</h2>
                        <p class="card-subtitle">Real-time aggregate index of your mental health.</p>
                    </div>
                    <div class="wellness-score-container">
                        <div class="wellness-ring-wrapper">
                            <svg class="chart-svg" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="cyanPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#06b6d4" />
                                        <stop offset="100%" stop-color="#a855f7" />
                                    </linearGradient>
                                </defs>
                                <circle class="svg-ring-bg" cx="50" cy="50" r="40" stroke-width="8" />
                                <circle class="svg-ring-active" cx="50" cy="50" r="40" stroke-width="8" 
                                    stroke-dasharray="251.2" 
                                    stroke-dashoffset="${251.2 - (251.2 * wellnessScore / 100)}" />
                            </svg>
                            <div class="wellness-score-number">${wellnessScore}%</div>
                        </div>
                        <div class="wellness-score-details">
                            <h3>${wellnessDesc}</h3>
                            <p>${wellnessAction}</p>
                        </div>
                    </div>
                </div>

                <!-- Exam Countdown -->
                <div class="card exam-countdown-card">
                    <div class="countdown-exam-name">${examName} EXAM</div>
                    <div class="countdown-digits">${daysLeft}</div>
                    <div class="countdown-label">DAYS TO GO</div>
                </div>
            </div>

            <!-- Metrics Quick Grid -->
            <div class="dashboard-metrics-grid">
                <div class="card metric-card">
                    <div class="metric-icon-box stress-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>
                    </div>
                    <div class="metric-info">
                        <h4>Stress Level</h4>
                        <div class="metric-value-container">
                            <span class="metric-value">${averages.stress}%</span>
                            <span class="metric-trend ${averages.stressTrend > 0 ? 'up' : 'down'}">${averages.stressTrend >= 0 ? '+' : ''}${averages.stressTrend}%</span>
                        </div>
                    </div>
                </div>

                <div class="card metric-card">
                    <div class="metric-icon-box burnout-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M8.56 2.75c4.37-1 8.96 1.13 10.96 5.25c2 4.13.78 9.14-2.8 11.87A10 10 0 0 1 2.25 12c0-3.83 2.5-7.3 6.31-8.75zM12 8v4l3 3"></path></svg>
                    </div>
                    <div class="metric-info">
                        <h4>Burnout Index</h4>
                        <div class="metric-value-container">
                            <span class="metric-value">${averages.burnout}%</span>
                            <span class="metric-trend ${averages.burnoutTrend > 0 ? 'up' : 'down'}">${averages.burnoutTrend >= 0 ? '+' : ''}${averages.burnoutTrend}%</span>
                        </div>
                    </div>
                </div>

                <div class="card metric-card">
                    <div class="metric-icon-box doubt-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"></path></svg>
                    </div>
                    <div class="metric-info">
                        <h4>Self-Doubt</h4>
                        <div class="metric-value-container">
                            <span class="metric-value">${averages.doubt}%</span>
                            <span class="metric-trend ${averages.doubtTrend > 0 ? 'up' : 'down'}">${averages.doubtTrend >= 0 ? '+' : ''}${averages.doubtTrend}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Layout: SVG Trends & Schedule & Achievements -->
            <div class="dashboard-bottom-grid">
                <!-- SVG Trends Chart -->
                <div class="card" style="grid-row: span 2;">
                    <div class="chart-header">
                        <h2>Well-being Trends</h2>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <div class="legend-color" style="background-color: var(--accent-rose)"></div>
                                <span>Stress</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color" style="background-color: var(--accent-cyan)"></div>
                                <span>Self-Doubt</span>
                            </div>
                        </div>
                    </div>
                    <div class="chart-canvas-container">
                        ${this.generateSVGChart(state.logs)}
                    </div>
                </div>

                <!-- Daily Planner card -->
                <div class="card dashboard-planner">
                    <h2>Study & Wellness Balance</h2>
                    <p class="card-subtitle" style="margin-bottom: 1rem;">Keep alignment between academic tasks and recovery breaks.</p>
                    <div class="planner-list" id="planner-tasks-container">
                        <!-- Loaded via js -->
                    </div>
                </div>

                <!-- Achievements Card -->
                <div class="card dashboard-achievements">
                    <h2>Milestone Achievements</h2>
                    <p class="card-subtitle" style="margin-bottom: 1rem;">Unlock motivational badges through consistent well-being pacing.</p>
                    <div class="achievements-list">
                        ${badgesHtml}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;
        this.renderPlannerTasks();
    },

    /**
     * Render the custom SVG trend chart
     */
    generateSVGChart: function(logs) {
        if (!logs || logs.length === 0) {
            return `
                <div class="analysis-placeholder">
                    <svg class="analysis-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    <h3>No Journal Logs Yet</h3>
                    <p>Complete your first daily journal to start tracking stress and self-doubt trends.</p>
                </div>
            `;
        }

        // Use last 7 logs for clean rendering
        const dataset = [...logs].slice(-7);
        const width = 500;
        const height = 220;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const maxVal = 100;
        const count = dataset.length;

        // X coordinate logic
        const getX = (index) => {
            if (count <= 1) return paddingLeft + chartWidth / 2;
            return paddingLeft + (index / (count - 1)) * chartWidth;
        };

        // Y coordinate logic (0 is at top in SVG)
        const getY = (val) => {
            return paddingTop + chartHeight - (val / maxVal) * chartHeight;
        };

        // Generate lines
        let stressPathPoints = [];
        let doubtPathPoints = [];

        dataset.forEach((log, idx) => {
            const x = getX(idx);
            const yStress = getY(log.analysis.stress);
            const yDoubt = getY(log.analysis.doubt);
            stressPathPoints.push(`${x},${yStress}`);
            doubtPathPoints.push(`${x},${yDoubt}`);
        });

        const stressPath = `M ${stressPathPoints.join(' L ')}`;
        const doubtPath = `M ${doubtPathPoints.join(' L ')}`;

        // Areas (for smooth gradients)
        const stressAreaPath = stressPathPoints.length > 0 
            ? `${stressPath} L ${getX(count-1)},${getY(0)} L ${getX(0)},${getY(0)} Z` 
            : '';
        const doubtAreaPath = doubtPathPoints.length > 0 
            ? `${doubtPath} L ${getX(count-1)},${getY(0)} L ${getX(0)},${getY(0)} Z` 
            : '';

        // Generate grid lines
        let grids = '';
        for (let i = 0; i <= 4; i++) {
            const val = i * 25;
            const y = getY(val);
            grids += `
                <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" />
                <text class="chart-label chart-y-label" x="${paddingLeft - 8}" y="${y + 4}">${val}</text>
            `;
        }

        // Generate X labels
        let xLabels = '';
        dataset.forEach((log, idx) => {
            const x = getX(idx);
            const date = new Date(log.analysis.timestamp);
            const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
            xLabels += `
                <text class="chart-label" x="${x}" y="${height - 10}">${dateStr}</text>
                <circle class="chart-dot" cx="${x}" cy="${getY(log.analysis.stress)}" fill="var(--accent-rose)" stroke="var(--bg-secondary)" />
                <circle class="chart-dot" cx="${x}" cy="${getY(log.analysis.doubt)}" fill="var(--accent-cyan)" stroke="var(--bg-secondary)" />
            `;
        });

        return `
            <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="stressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--accent-rose)" stop-opacity="0.12"/>
                        <stop offset="100%" stop-color="var(--accent-rose)" stop-opacity="0.0"/>
                    </linearGradient>
                    <linearGradient id="doubtAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.12"/>
                        <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
                
                <!-- Grid Lines -->
                ${grids}

                <!-- Areas -->
                <path class="chart-area-stress" d="${stressAreaPath}" />
                <path class="chart-area-doubt" d="${doubtAreaPath}" />

                <!-- Line Graphs -->
                <path class="chart-line-stress" d="${stressPath}" />
                <path class="chart-line-doubt" d="${doubtPath}" />

                <!-- Axes -->
                <line class="chart-axis-line" x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" />
                <line class="chart-axis-line" x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" />

                <!-- Dots & Labels -->
                ${xLabels}
            </svg>
        `;
    },

    /**
     * Render Study & Wellness tasks
     */
    renderPlannerTasks: function() {
        const container = document.getElementById('planner-tasks-container');
        if (!container) return;

        const state = window.AppState.get();
        const tasks = state.plannerTasks || [];

        if (tasks.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No active tasks today.</p>`;
            return;
        }

        let html = '';
        tasks.forEach(task => {
            html += `
                <div class="planner-item ${task.completed ? 'completed' : ''}">
                    <div class="planner-status-circle" onclick="window.Dashboard.toggleTask(${task.id})">
                        ${task.completed ? '✓' : ''}
                    </div>
                    <div class="planner-text">
                        <h4>${window.escapeHTML(task.title)}</h4>
                        <p>${window.escapeHTML(task.desc)}</p>
                    </div>
                    <span class="planner-badge ${task.category}">${window.escapeHTML(task.category)}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Toggle status of study task
     */
    toggleTask: function(taskId) {
        window.AppState.togglePlannerTask(taskId);
        this.renderPlannerTasks();
        // Update wellness index as toggled tasks might affect current view scores
        const averages = window.AppState.getAverages();
        const wellnessScore = Math.max(10, Math.round(100 - (averages.stress * 0.4 + averages.burnout * 0.4 + averages.doubt * 0.2)));
        const ring = document.querySelector('.svg-ring-active');
        if (ring) {
            ring.style.strokeDashoffset = 251.2 - (251.2 * wellnessScore / 100);
        }
        const scoreNum = document.querySelector('.wellness-score-number');
        if (scoreNum) {
            scoreNum.textContent = `${wellnessScore}%`;
        }
    }
};
