/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
// https://stackoverflow.com/questions/69237143/how-do-i-get-the-audio-frequency-from-my-mic-using-javascript
// https://newt.phys.unsw.edu.au/music/note/
// https://newt.phys.unsw.edu.au/jw/notes.html
// https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies


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
		this.midi = null;
		this.instrumentMidiOffsets = [];
		this.bListenToMidi = true;
        this.currentNote = null;
        this.currentNoteIndex = 0;
	}

	restartAudio(inAudio, inMidi, inInstrumentMidiOffsets, bInListenToMidi) {
		if (!inAudio || !inMidi || !inMidi.tracks) {
			console.error("Invalid audio element or midi.");
			return;
		}
        // First stop if required.
		this.stopAudio();

		// TODO
		console.warn("The first track of the midi data is used.");

        // https://webaudio.github.io/web-audio-api/
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
            this.bListenToMidi = bInListenToMidi;
            this.currentNote = null;
            this.currentNoteIndex = 0;
    
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
        let bUpdatedAutocorrelatedPitch = false;
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
                bUpdatedAutocorrelatedPitch = true;
            }
            else {
                // console.warn("Pitch not properly set. (rms too low?)");
            }
        }

        // Find the midi data at the current time of the audio file that is playing.
		// Since clocks are not accurate the current MIDI tick should be synced to audio playtime.
		// To get a position in midi ticks from playback seconds, we can use methods in the midi header class.
		// console.log(midi.header.secondsToTicks(2));
		// TODO: Optimize this somehow. Perhaps reformat the data to be keyed to time.	
		// TODO: Assumed is the MIDI comes with 1 track only.	
        // TODO: Current note is processed, not a chord. detect lowest frequency note and skip chord? do chord comparison?
        {
            // We track the current midi note index, which needs to be matched to the audio playback by time.
            // The loop starts at this.currentNoteIndex to avoid running over all old data, so we assume we don't go back in time with the audio.
            for (; this.currentNoteIndex < this.midi.tracks[0].notes.length; this.currentNoteIndex++) {
                this.currentNote = this.midi.tracks[0].notes[this.currentNoteIndex];

                if (timeAsTick > (this.currentNote.ticks + this.currentNote.durationTicks)) {
                    // This note is in the past and no longer 'during'.
                    // We keep the index as a tracker but set the note to null because it is not matching audio time.
                    this.currentNote = null;
                    continue;
                }

                if (timeAsTick < this.currentNote.ticks) {
                    // This part of the audio is in the future.
                    // Expected is that notes are ordered past to future, so at this point there is nothing left to do but wait.
                    // We keep the index as a tracker but set the note to null because it is not matching audio time.
                    this.currentNote = null;
                    break;
                }

                // Found a note that should be playing right now.
                break;
            }

            // We should walk back from the current index to register any notes that we missed. 
            // Mark those notes missed so we don't walk further than we have to.
            for (let i = this.currentNoteIndex - 1; i >= 0; i--) {
                let oldNote = this.midi.tracks[0].notes[i];
                if (typeof oldNote.bHit !== 'undefined') {
                    break;
                }
                oldNote.bHit = false;
                let missedNoteEvent = new Event('audio-processor-missed-note', { bubbles: false });
                missedNoteEvent.noteIndex = i;
                window.dispatchEvent(missedNoteEvent);
            }
        }

        if (this.bListenToMidi && this.currentNote != null && !this.currentNote.playedByOscillator) {
            // https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3
            const midiFrequency = midiUtils.midiNumberToFrequency(this.currentNote.midi);
            // console.log("Note frequency: " + midiFrequency);
    
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
            this.oscillator.stop(this.audioContext.currentTime + this.midi.header.ticksToSeconds(this.currentNote.durationTicks));
            this.currentNote.playedByOscillator = true;
        }

        // Process the MIDI data against the current audio data (microphone), to see if we find matching frequencies (like playing guitar along to music).
        if (bUpdatedAutocorrelatedPitch && this.currentNote != null) {
            // const freqDiff = Math.abs(this.autocorrolatedPitch - midiFrequency);
            // console.log("Abs freq diff between midi (" + midiFrequency + ") and audio ("+ this.autocorrolatedPitch + "): " + freqDiff);
            // console.log("Cents off from pitch (" + this.autocorrolatedPitch + "): "+ midiUtils.centsOffFromPitch(this.autocorrolatedPitch, this.currentNote.midi)); 
            // console.log(this.autocorrolatedPitch);
            // console.log(this.currentNote.midi);

            // console.log(this.currentNote);

            // Only need to register the hit once.
            if (!this.currentNote.bHit) {
                const absCentsDiff = Math.abs(midiUtils.centsOffFromPitch(this.autocorrolatedPitch, this.currentNote.midi));
                // Cents tolerance can help if detection is innacurate.
                const centsTolerance = 40;
                if (absCentsDiff < centsTolerance) {
                    // Note that we don't register a miss here, only a hit. A miss is irrelevant since we can make a hit at any time while the note plays.
                    this.currentNote.bHit = true;
                    // console.log("Hit note: " + this.currentNoteIndex);
                    let hitNoteEvent = new Event('audio-processor-hit-note', { bubbles: false });
                    hitNoteEvent.noteIndex = this.currentNoteIndex;
                    window.dispatchEvent(hitNoteEvent);
                }
            }
        }
	}
}