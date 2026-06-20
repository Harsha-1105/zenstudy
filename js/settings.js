/**
 * ZenStudy - Settings & Customization Module
 * Manages user profile customization, target exam configurations, and Privacy PIN Lock parameters.
 */

window.Settings = {
    selectedExam: 'JEE',

    render: function() {
        const state = window.AppState.get();
        const settings = state.settings;
        this.selectedExam = settings.exam || 'JEE';

        const html = `
            <div class="header-wrapper">
                <div class="welcome-section">
                    <h1>Settings & Customization</h1>
                    <p>Configure your targeted exam date, custom API keys, and personalize your digital companion.</p>
                </div>
            </div>

            <div class="card settings-layout">
                <!-- User Profile Form -->
                <div class="settings-section">
                    <h2>Personal Information</h2>
                    <div class="form-group">
                        <label for="student-name">Your Name</label>
                        <input type="text" id="student-name" class="form-control" value="${window.escapeHTML(settings.name || '')}" placeholder="e.g. Aarav Sharma" />
                    </div>
                </div>

                <!-- Exam Targeting -->
                <div class="settings-section">
                    <h2>Target Competitive Exam</h2>
                    <div class="form-group">
                        <label>Select your exam focus area</label>
                        <div class="exam-grid-select">
                            <div class="exam-select-card ${this.selectedExam === 'JEE' ? 'selected' : ''}" onclick="window.Settings.selectExam('JEE', this)">
                                JEE (Engineering)
                            </div>
                            <div class="exam-select-card ${this.selectedExam === 'NEET' ? 'selected' : ''}" onclick="window.Settings.selectExam('NEET', this)">
                                NEET (Medical)
                            </div>
                            <div class="exam-select-card ${this.selectedExam === 'GATE' ? 'selected' : ''}" onclick="window.Settings.selectExam('GATE', this)">
                                GATE (Postgrad Engg)
                            </div>
                            <div class="exam-select-card ${this.selectedExam === 'CAT' ? 'selected' : ''}" onclick="window.Settings.selectExam('CAT', this)">
                                CAT (Management)
                            </div>
                            <div class="exam-select-card ${this.selectedExam === 'CUET' ? 'selected' : ''}" onclick="window.Settings.selectExam('CUET', this)">
                                CUET (Undergrad Central)
                            </div>
                            <div class="exam-select-card ${this.selectedExam === 'Boards' ? 'selected' : ''}" onclick="window.Settings.selectExam('Boards', this)">
                                Board Exams
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 1rem;">
                        <label for="exam-target-date">Exam Date</label>
                        <input type="date" id="exam-target-date" class="form-control" value="${settings.examDate || ''}" />
                    </div>
                </div>

                <!-- Privacy & Security -->
                <div class="settings-section">
                    <h2>Privacy & Security</h2>
                    <div class="pin-settings-box">
                        <div class="switch-control">
                            <div class="switch-label">
                                <h3>Enable Privacy PIN Lock</h3>
                                <p>Require a 4-digit PIN on startup to shield personal journals from others on shared devices.</p>
                            </div>
                            <input type="checkbox" id="pin-lock-toggle" class="switch-input" ${settings.pinEnabled ? 'checked' : ''} onchange="window.Settings.togglePinInputs(this.checked)" />
                        </div>
                        
                        <div class="form-group ${settings.pinEnabled ? '' : 'hidden'}" id="pin-input-group" style="margin-top: 0.5rem; transition: all 0.3s ease;">
                            <label for="pin-lock-value">Set 4-Digit Passcode PIN</label>
                            <input type="password" id="pin-lock-value" class="form-control" maxlength="4" pattern="[0-9]*" value="${settings.pinHash || ''}" placeholder="••••" style="max-width: 120px; letter-spacing: 0.4em; text-align: center; font-size: 1.25rem;" oninput="this.value=this.value.replace(/[^0-9]/g,'')" />
                        </div>
                    </div>
                </div>

                <!-- Gemini API configuration -->
                <div class="settings-section">
                    <h2>GenAI Advanced Settings</h2>
                    <p class="card-subtitle" style="margin-top: -1rem; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary)">
                        By default, ZenStudy uses a local heuristics parser to analyze logs offline. To unlock live LLM feedback, supply a Google Gemini API Key.
                    </p>
                    <div class="form-group">
                        <label for="gemini-key">Google Gemini API Key (Optional)</label>
                        <input type="password" id="gemini-key" class="form-control" value="${settings.geminiKey || ''}" placeholder="AIzaSy..." />
                    </div>
                </div>

                <!-- Action buttons -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-color);">
                    <button class="btn btn-secondary" style="border-color:rgba(244,63,94,0.3); color:var(--accent-rose)" onclick="window.Settings.clearData()">
                        Clear Local Data
                    </button>
                    <button class="btn btn-primary" onclick="window.Settings.saveSettings()">
                        Save Changes
                    </button>
                </div>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;
    },

    selectExam: function(examName, element) {
        this.selectedExam = examName;
        document.querySelectorAll('.exam-select-card').forEach(card => card.classList.remove('selected'));
        element.classList.add('selected');
    },

    togglePinInputs: function(isChecked) {
        const inputGroup = document.getElementById('pin-input-group');
        if (!inputGroup) return;
        
        if (isChecked) {
            inputGroup.classList.remove('hidden');
        } else {
            inputGroup.classList.add('hidden');
            const pinVal = document.getElementById('pin-lock-value');
            if (pinVal) pinVal.value = ''; // Reset PIN field if disabled
        }
    },

    saveSettings: function() {
        const nameInput = document.getElementById('student-name');
        const dateInput = document.getElementById('exam-target-date');
        const keyInput = document.getElementById('gemini-key');
        const pinToggle = document.getElementById('pin-lock-toggle');
        const pinVal = document.getElementById('pin-lock-value');

        const name = nameInput ? nameInput.value.trim() : 'Student';
        const date = dateInput ? dateInput.value : '';
        const key = keyInput ? keyInput.value.trim() : '';
        const pinEnabled = pinToggle ? pinToggle.checked : false;
        const pinHash = pinVal ? pinVal.value.trim() : '';

        // Validate PIN settings
        if (pinEnabled && pinHash.length !== 4) {
            alert("Security Error: Please input a valid 4-digit numeric PIN.");
            return;
        }

        // Save to state
        window.AppState.updateSettings({
            name: name,
            exam: this.selectedExam,
            examDate: date,
            geminiKey: key,
            pinEnabled: pinEnabled,
            pinHash: pinHash
        });

        // Trigger updates in sidebar elements
        const nameDisplay = document.getElementById('profile-name-display');
        const examDisplay = document.getElementById('profile-exam-display');
        const avatarDisplay = document.getElementById('profile-avatar-display');

        if (nameDisplay) nameDisplay.textContent = window.escapeHTML(name);
        if (examDisplay) examDisplay.textContent = `${this.selectedExam} Aspirant`;
        if (avatarDisplay && name.length > 0) {
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            avatarDisplay.textContent = initials;
        }

        alert("Settings saved successfully.");
        // Redirect to dashboard
        window.AppRouter.navigate('dashboard');
    },

    clearData: function() {
        if (confirm("Are you sure you want to delete all daily logs, chat history, and configuration settings? This action is irreversible.")) {
            window.AppState.reset();
            alert("All local data cleared successfully.");
            window.location.reload();
        }
    }
};
