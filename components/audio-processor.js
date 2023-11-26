class AudioProcessor {
	constructor() {
		/* State */
		this.isPlaying = false;
		this.audioContext = new AudioContext();
		this.intervalResolution = 50;
		this.analyserNode = null;
		this.audioData = null;
		this.corrolatedSignal = null;
		this.localMaxima = null;
		this.minRelevantRMS = 0.01;
		this.currentRMS = 0;
		this.autocorrolatedPitch = 0;
		this.midi = 0;
		this.instrumentMidiOffsets = [];
		this.listenToMidi = true;
	}

	restartAudio(inAudio, inMidi, inInstrumentMidiOffsets, inListenToMidi) {
		if (!inAudio || !inMidi || inMidi.tracks.length != 1) {
			console.error("Invalid audio element or midi. Midi track count must be 1.");
			return;
		}
		this.stopAudio();

		navigator.mediaDevices.getUserMedia({ video: false, audio: true })
		.then((stream) => {
            console.log("Starting audio");

            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 2048;
            this.bufferLength = this.analyserNode.fftSize;
            this.audioData = new Float32Array(this.bufferLength);
            this.corrolatedSignal = new Float32Array(this.analyserNode.fftSize);
            this.localMaxima = new Array(4);

            this.source = this.audioContext.createMediaStreamSource(stream);
			this.source.connect(this.analyserNode);

            this.audio = inAudio;
            this.midi = inMidi;
            this.instrumentMidiOffsets = inInstrumentMidiOffsets
            this.listenToMidi = inListenToMidi;
    
            this.audio.play();
            this.isPlaying = true;
            this.ProcessMIDIWithAudioSyncInterval = setInterval(() => { this.ProcessMIDIWithAudioSync() }, this.intervalResolution);
    
            const restartAudioEvent = new Event('audio-processor-restarts-audio', { bubbles: false });
            window.dispatchEvent(restartAudioEvent);
		}).catch((err) => {
			console.error(`${err.name}: ${err.message}`);
			console.error("Could not find a microphone.");
		});
	}

	stopAudio() {
		if (!this.isPlaying) {
			return;
		}
		console.log("Stopping audio");
		if (this.audio) {
			this.audio.pause();
			this.audio = null;
		}
		clearInterval(this.ProcessMIDIWithAudioSyncInterval);
		this.isPlaying = false;
		const stopAudioEvent = new Event('audio-processor-stops-audio', { bubbles: false });
		window.dispatchEvent(stopAudioEvent);
	}

	ProcessMIDIWithAudioSync() {
        // Collect current audio data.
        this.analyserNode.getFloatTimeDomainData(this.audioData);
        const currentTime = this.audio.currentTime;
        const timeAsTick = this.midi.header.secondsToTicks(currentTime);
        // console.log("Current play time: " + currentTime + ". timeAsTick: " + timeAsTick);
        // console.log(this.midi.tracks[0].notes);

        // Update RMS value (volume).
        {
            let sum = 0;
            for (let i = 0; i < this.bufferLength; i++) {
                const val = this.audioData[i];
                sum += val * val;
            }
            this.currentRMS = Math.sqrt(sum / this.bufferLength);
		}

        // autocorrelate pitch.
        let updatedAutocorrelatedPitch = false;
        if (this.currentRMS > this.minRelevantRMS) {
            // https://github.com/cwilso/PitchDetect/blob/main/js/pitchdetect.js
            // autocorrelation V2

            // Implements the ACF2+ algorithm
            let bufferCopy = this.audioData;
        
            let r1 = 0;
            let r2 = this.bufferLength - 1;
            // let thres = 0.2;
            let thres = 0.3;
            for (let i = 0; i < this.bufferLength / 2; i++) {
                if (Math.abs(bufferCopy[i]) < thres) { 
                    r1 = i; 
                    break; 
                }
            }
            for (let i = 1; i < this.bufferLength / 2; i++) {
                if (Math.abs(bufferCopy[this.bufferLength - i]) < thres) { 
                    r2 = this.bufferLength - i; 
                    break; 
                }
                bufferCopy = bufferCopy.slice(r1, r2);
            }
        
            var c = new Array(this.bufferLength).fill(0);
            for (let i = 0; i < this.bufferLength; i++) {
                for (let j = 0; j < this.bufferLength - i; j++) {
                    c[i] = c[i] + bufferCopy[j] * bufferCopy[j + i];
                }
            }
        
            let d=0; 
            while (c[d] > c[d + 1]) {
                d++;
            }

            let maxval = -1;
            let maxpos = -1;
            for (let i = d; i < this.bufferLength; i++) {
                if (c[i] > maxval) {
                    maxval = c[i];
                    maxpos = i;
                }
            }
            let T0 = maxpos;
        
            let x1 = c[T0-1];
            let x2 = c[T0];
            let x3 = c[T0 + 1];
            let a = (x1 + x3 - 2 * x2) / 2;
            let b = (x3 - x1) / 2;
            if (a) {
                T0 = T0 - b / (2 * a);
            }
        
            if (T0 != -1) {
                this.autocorrolatedPitch = this.audioContext.sampleRate / T0;
                updatedAutocorrelatedPitch = true;
            }
            else {
                // console.warn("Pitch not properly set. (rms too low?)");
            }
        }

        // Find the midi data at the current time of the audio file that is playing.
		// Since clocks are not accurate the current MIDI tick should be synced to audio playtime.
		// To get a position in midi ticks from playback seconds, we can use methods in the midi header class.
		// https://stackoverflow.com/questions/2038313/converting-midi-ticks-to-actual-playback-seconds
		// console.log(midi.header.secondsToTicks(2));
		// TODO: Optimize this somehow. Perhaps reformat the data to be keyed to time.	
		// TODO: Assumed is the MIDI comes with 1 track only.	
        // TODO: Current note is processed, not a chord. detect lowest frequency note and skip chord? do chord comparison?
        let currentNote = null;
        {
            for (let i = 0; i < this.midi.tracks[0].notes.length; i++) {
                let note = this.midi.tracks[0].notes[i];
                if (timeAsTick < note.ticks) {
                    // This part of the audio has not been reached yet, there is nothing to do.
                    break;
                }
                if (timeAsTick > (note.ticks + note.durationTicks)) {
                    // This note is in the past and no longer 'during'.
                    continue;
                }
    
                currentNote = note;
                // console.log(note);
            }
        }

        if (this.listenToMidi && currentNote != null && !currentNote.playedByOscillator) {
            const midiFrequency = UIUtils.midiNumberToFrequency(currentNote.midi);
            // console.log("Note frequency: " + midiFrequency);
    
            // If listening to midi
            // oscillator for debugging. It can't start / stop twice, so recreate it.
            if (this.oscillator) {
                this.oscillator.disconnect(this.audioContext.destination);
            }
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = "sine";
            // this.oscillator.gain = 0.5;
            // console.log(this.oscillator);
            this.oscillator.connect(this.audioContext.destination);
            this.oscillator.frequency.setTargetAtTime(midiFrequency, this.audioContext.currentTime, 0);
            this.oscillator.start(this.audioContext.currentTime);
            this.oscillator.stop(this.audioContext.currentTime + this.midi.header.ticksToSeconds(note.durationTicks));
            currentNote.playedByOscillator = true;
        }

        // Process the MIDI data against the current audio data (microphone), to see if we find matching frequencies (like playing guitar along to music).
        if (updatedAutocorrelatedPitch && currentNote != null) {
            // const freqDiff = Math.abs(this.autocorrolatedPitch - midiFrequency);
            // console.log("Abs freq diff between midi (" + midiFrequency + ") and audio ("+ this.autocorrolatedPitch + "): " + freqDiff);
            // console.log("Cents off from pitch (" + this.autocorrolatedPitch + "): "+ UIUtils.centsOffFromPitch(this.autocorrolatedPitch, currentNote.midi)); 
            // console.log(this.autocorrolatedPitch);
            // console.log(currentNote.midi);

            const absCentsDiff = Math.abs(UIUtils.centsOffFromPitch(this.autocorrolatedPitch, currentNote.midi));
            if (absCentsDiff < 40) {
                console.log("Hit!: " + absCentsDiff);
                currentNote.hit = true;
            }
        }
	}
}