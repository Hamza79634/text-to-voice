const speakButton = document.getElementById('speak-button');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const stopButton = document.getElementById('stop-button');
const voiceInputButton = document.getElementById('voice-input-button');
const stopVoiceInputButton = document.getElementById('stop-voice-input-button');
const textInput = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice-select');
const volumeControl = document.getElementById('volume-control');
const rateControl = document.getElementById('rate-control');
const pitchControl = document.getElementById('pitch-control');

let voices = [];
let utterance = null;
let recognition = null;
let lastTranscript = '';
let speaking = false;

// SpeechSynthesis functions
function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

function speak() {
    const text = textInput.value;
    if (utterance) {
        speechSynthesis.cancel(); // Stop previous utterance if any
    }
    utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceIndex = voiceSelect.value;
    if (voices[selectedVoiceIndex]) {
        utterance.voice = voices[selectedVoiceIndex];
    }
    utterance.volume = parseFloat(volumeControl.value);
    utterance.rate = parseFloat(rateControl.value);
    utterance.pitch = parseFloat(pitchControl.value);
    speechSynthesis.speak(utterance);
    speaking = true;
}

function pause() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
    }
}

function resume() {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
    }
}

function stop() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    speaking = false;
}

// SpeechRecognition functions
function initializeSpeechRecognition() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert('Speech Recognition API not supported.');
        return;
    }
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript = event.results[i][0].transcript.trim();
                if (transcript !== lastTranscript) {
                    textInput.value += ' ' + transcript;
                    lastTranscript = transcript;
                }
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
        console.log('Speech recognition ended');
    };
}

function startVoiceInput() {
    if (recognition) {
        recognition.start();
    } else {
        initializeSpeechRecognition();
        recognition.start();
    }
}

function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    switch (event.key) {
        case ' ': // Spacebar
            if (speaking) {
                stop();
            } else {
                speak();
            }
            break;
        case 's': // Start voice input
            startVoiceInput();
            break;
        case 'e': // Stop voice input
            stopVoiceInput();
            break;
        case 'p': // Pause speech synthesis
            pause();
            break;
        case 'r': // Resume speech synthesis
            resume();
            break;
        case 'x': // Stop speech synthesis
            stop();
            break;
    }
}

// Event listeners
document.addEventListener('keydown', handleKeyboardShortcuts);
speakButton.addEventListener('click', speak);
pauseButton.addEventListener('click', pause);
resumeButton.addEventListener('click', resume);
stopButton.addEventListener('click', stop);
voiceInputButton.addEventListener('click', startVoiceInput);
stopVoiceInputButton.addEventListener('click', stopVoiceInput);
speechSynthesis.addEventListener('voiceschanged', populateVoiceList);
populateVoiceList();

