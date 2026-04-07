// DOM Elements
const tripForm = document.getElementById('tripForm');
const submitBtn = document.getElementById('submitBtn');
const voiceBtn = document.getElementById('voiceBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const formSection = document.querySelector('.form-section');

// Voice search: Web Speech API (SpeechRecognition)
let recognition = null;
let isListening = false;
if (typeof window !== 'undefined') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (SpeechRecognition && voiceBtn) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.addEventListener('result', (event) => {
            const transcript = Array.from(event.results)
                .map(r => r[0].transcript)
                .join('')
                .trim();
            if (transcript) {
                const locationInput = document.getElementById('location');
                // Populate location by default
                locationInput.value = transcript;
                locationInput.focus();

                // Try to parse commands from the transcript to fill other inputs
                processVoiceCommand(transcript);
            }
        });

        recognition.addEventListener('end', () => {
            isListening = false;
            updateVoiceUI();
        });

        recognition.addEventListener('error', (e) => {
            console.error('Speech recognition error:', e);
            isListening = false;
            updateVoiceUI();
            showError('Voice input unavailable. Please try typing.');
        });

        voiceBtn.addEventListener('click', () => {
            if (!recognition) return;
            try {
                if (!isListening) {
                    recognition.start();
                    isListening = true;
                } else {
                    recognition.stop();
                    isListening = false;
                }
            } catch (err) {
                console.warn('Speech recognition start/stop error', err);
            }
            updateVoiceUI();
        });
    } else if (voiceBtn) {
        // Disable voice button if not supported
        voiceBtn.setAttribute('disabled', '');
        voiceBtn.title = 'Voice input not supported in this browser';
    }
}

function updateVoiceUI() {
    if (!voiceBtn) return;
    if (isListening) {
        voiceBtn.classList.add('listening');
        voiceBtn.setAttribute('aria-pressed', 'true');
        voiceBtn.textContent = '⏺️';
    } else {
        voiceBtn.classList.remove('listening');
        voiceBtn.setAttribute('aria-pressed', 'false');
        voiceBtn.textContent = '🎙️';
    }
}

// Parse voice transcript to fill other form fields (budget, duration, interests)
function processVoiceCommand(text) {
    if (!text) return;
    const lower = text.toLowerCase();

    // Budget keywords -> radio values
    const budgetMap = {
        'budget': 'Budget-Friendly',
        'budget friendly': 'Budget-Friendly',
        'budget-friendly': 'Budget-Friendly',
        'moderate': 'Moderate',
        'premium': 'Premium',
        'luxury': 'Luxury'
    };

    for (const k in budgetMap) {
        if (lower.includes(k)) {
            const val = budgetMap[k];
            const el = document.querySelector(`input[name="budget"][value="${val}"]`);
            if (el) el.checked = true;
        }
    }

    // Duration keywords -> select values
    const durationMap = {
        'weekend': 'Weekend (2-3 days)',
        'short': 'Short Trip (4-5 days)',
        'week long': 'Week Long (6-7 days)',
        'week': 'Week Long (6-7 days)',
        'extended': 'Extended (8-14 days)',
        'long': 'Long Vacation (15+ days)',
        'vacation': 'Long Vacation (15+ days)'
    };
    for (const k in durationMap) {
        if (lower.includes(k)) {
            const sel = document.getElementById('duration');
            if (sel) sel.value = durationMap[k];
        }
    }

    // Interests mapping
    const interestsMap = {
        'adventure': 'Adventure & Outdoors',
        'outdoor': 'Adventure & Outdoors',
        'beach': 'Beach & Relaxation',
        'relax': 'Beach & Relaxation',
        'culture': 'Culture & History',
        'history': 'Culture & History',
        'food': 'Food & Culinary',
        'culinary': 'Food & Culinary',
        'nature': 'Nature & Wildlife',
        'wildlife': 'Nature & Wildlife',
        'nightlife': 'Nightlife & Entertainment',
        'shopping': 'Shopping',
        'photo': 'Photography',
        'photography': 'Photography',
        'wellness': 'Spiritual & Wellness',
        'spiritual': 'Spiritual & Wellness',
        'sport': 'Sports & Activities',
        'sports': 'Sports & Activities',
        'art': 'Art & Museums',
        'museum': 'Art & Museums',
        'romance': 'Romance & Honeymoon',
        'honeymoon': 'Romance & Honeymoon'
    };

    for (const k in interestsMap) {
        if (lower.includes(k)) {
            const val = interestsMap[k];
            const cb = document.querySelector(`input[name="interests"][value="${val}"]`);
            if (cb) cb.checked = true;
        }
    }

    // Commands: reset or submit
    if (lower.includes('reset') || lower.includes('clear')) {
        tripForm.reset();
        resetForm();
        return;
    }

    if (lower.includes('submit') || lower.includes('find') || lower.includes('search') || lower.includes('go')) {
        // small delay to ensure fields updated
        setTimeout(() => {
            tripForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 250);
    }
}

// Form Submit Handler
tripForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const location = document.getElementById('location').value.trim();
    const duration = document.getElementById('duration').value;

    // Get selected budget
    const budgetRadio = document.querySelector('input[name="budget"]:checked');
    if (!budgetRadio) {
        showError('Please select a budget level.');
        return;
    }
    const budget = budgetRadio.value;

    // Get selected interests
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(interestCheckboxes).map(cb => cb.value);

    if (interests.length === 0) {
        showError('Please select at least one interest.');
        return;
    }

    // Show loading state
    showLoading();

    try {
        const response = await fetch('/api/plan-trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location,
                budget,
                interests,
                duration
            })
        });

        const data = await response.json();

        if (data.success) {
            showResults(data.recommendations);
        } else {
            showError(data.error || 'Failed to generate recommendations.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please check your connection and try again.');
    }
});

// Show Loading State
function showLoading() {
    formSection.style.display = 'none';
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';

    // Scroll to loading
    loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show Results
function showResults(recommendations) {
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Convert markdown to HTML
    resultsContent.innerHTML = parseMarkdown(recommendations);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Show Error
function showError(message) {
    formSection.style.display = 'block';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'block';
    errorMessage.textContent = message;

    // Scroll to error
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorSection.style.display = 'none';
    }, 5000);
}

// Reset Form
function resetForm() {
    formSection.style.display = 'block';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';

    // Scroll to form
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Simple Markdown Parser
function parseMarkdown(text) {
    if (!text) return '';

    let html = text;

    // Escape HTML
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Bullet points
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-4]>)/g, '$1');
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive breaks
    html = html.replace(/<br><br>/g, '<br>');
    html = html.replace(/<br><\/p>/g, '</p>');
    html = html.replace(/<p><br>/g, '<p>');
    html = html.replace(/<\/h([1-4])><br>/g, '</h$1>');
    html = html.replace(/<br><h([1-4])>/g, '<h$1>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<br><ul>/g, '<ul>');

    return html;
}

// Add interest selection feedback
document.querySelectorAll('.interest-tag input').forEach(input => {
    input.addEventListener('change', function () {
        const selected = document.querySelectorAll('.interest-tag input:checked').length;
        if (selected > 0) {
            submitBtn.querySelector('.btn-text').textContent = `Find My Perfect Trip (${selected} interests)`;
        } else {
            submitBtn.querySelector('.btn-text').textContent = 'Find My Perfect Trip';
        }
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to reset
    if (e.key === 'Escape') {
        resetForm();
    }
});

// Console welcome message
console.log('%c✈️ Tripmind', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cPowered by Google Gemini AI', 'font-size: 14px; color: #a855f7;');
