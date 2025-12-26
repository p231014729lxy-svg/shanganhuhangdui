class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.masterGain);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.masterGain);

        this.enabled = false;
        this.bgmOscillators = [];
        this.currentBgm = null;
        
        // Volume Config
        this.masterGain.gain.value = 0.5; // Slightly increased from 0.3
        this.bgmGain.gain.value = 0.6;
        this.sfxGain.gain.value = 1.0;
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.enabled = true;
    }

    toggleMute() {
        if (this.masterGain.gain.value > 0) {
            this.masterGain.gain.value = 0;
            return false;
        } else {
            this.masterGain.gain.value = 0.3;
            return true;
        }
    }

    // --- Sound Effects (SFX) ---
    
    playTone(freq, type, duration, startTime = 0) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        
        gain.connect(this.sfxGain);
        osc.connect(gain);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
        
        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playJump() {
        // Frequency ramp up
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playCollect() {
        // High ping
        this.playTone(1200, 'sine', 0.1);
        this.playTone(2000, 'sine', 0.2, 0.05);
    }

    playBuy() {
        // Cash register-ish
        this.playTone(800, 'square', 0.1);
        this.playTone(1200, 'square', 0.2, 0.08);
    }

    playHit() {
        // Low noise/thud
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playWin() {
        // Arpeggio
        const now = 0;
        this.playTone(523.25, 'sine', 0.2, now);       // C5
        this.playTone(659.25, 'sine', 0.2, now + 0.1); // E5
        this.playTone(783.99, 'sine', 0.4, now + 0.2); // G5
        this.playTone(1046.50, 'square', 0.6, now + 0.3); // C6
    }

    // --- BGM System (Simple Sequencer) ---

    stopBgm() {
        this.bgmOscillators.forEach(o => {
            try { o.stop(); } catch(e){}
        });
        this.bgmOscillators = [];
        if (this.bgmTimer) clearInterval(this.bgmTimer);
    }

    playBgm(type) {
        if (this.currentBgm === type) return;
        this.stopBgm();
        this.currentBgm = type;
        
        if (!this.enabled) return;

        let notes = [];
        let speed = 200;

        if (type === 'lobby') {
            // Relaxed C Major
            notes = [
                261.63, 0, 329.63, 0, 392.00, 0, 329.63, 0, // C E G E
                293.66, 0, 349.23, 0, 440.00, 0, 349.23, 0  // D F A F
            ];
            speed = 300;
        } else if (type === 'game') {
            // Upbeat Mario-ish
            notes = [
                329.63, 329.63, 0, 329.63, 0, 261.63, 329.63, 0, 392.00, 0, 0, 0, 196.00, 0, 0, 0
            ];
            speed = 150;
        }

        let noteIndex = 0;
        this.bgmTimer = setInterval(() => {
            if (this.ctx.state === 'suspended') return;
            
            const freq = notes[noteIndex];
            if (freq > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.bgmGain);
                
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                // Increase BGM note volume (was 0.1)
                gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (speed/1000) * 0.8);
                
                osc.start();
                osc.stop(this.ctx.currentTime + (speed/1000));
            }
            noteIndex = (noteIndex + 1) % notes.length;
        }, speed);
    }
}
