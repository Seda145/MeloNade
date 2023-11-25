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
		this.minRelevantRMS = 0.025;
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
		console.log("Starting audio");

		this.analyserNode = this.audioContext.createAnalyser();
		this.analyserNode.fftSize = 2048;
		this.bufferLength = this.analyserNode.fftSize;
		this.audioData = new Float32Array(this.bufferLength);
		this.corrolatedSignal = new Float32Array(this.analyserNode.fftSize);
		this.localMaxima = new Array(4);

		navigator.mediaDevices.getUserMedia({ video: false, audio: true })
		.then((stream) => {
			this.source = this.audioContext.createMediaStreamSource(stream);
			this.source.connect(this.analyserNode);
		}).catch((err) => {
			console.error(`${err.name}: ${err.message}`);
			console.error("Could not find a microphone.");
		});

		this.audio = inAudio;
		this.midi = inMidi;
		this.instrumentMidiOffsets = inInstrumentMidiOffsets
		this.listenToMidi = inListenToMidi;

		this.audio.play();
		this.isPlaying = true;
		this.ProcessMIDIWithAudioSyncInterval = setInterval(() => { this.ProcessMIDIWithAudioSync() }, this.intervalResolution);

		const restartAudioEvent = new Event('audio-processor-restarts-audio', { bubbles: false });
		window.dispatchEvent(restartAudioEvent);
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
		// Since clocks are not accurate the current MIDI tick should be synced to audio playtime.
		// To get a position in midi ticks from playback seconds, we can use methods in the midi header class.
		// https://stackoverflow.com/questions/2038313/converting-midi-ticks-to-actual-playback-seconds
		// console.log(midi.header.secondsToTicks(2));
		// TODO: Optimize this somehow. Perhaps reformat the data to be keyed to time.	
		// TODO: Assumed is the MIDI comes with 1 track only.	
		const currentTime = this.audio.currentTime;
		const timeAsTick = this.midi.header.secondsToTicks(currentTime);
		// console.log("Current play time: " + currentTime + ". timeAsTick: " + timeAsTick);
		// console.log(this.midi.tracks[0].notes);

		this.analyserNode.getFloatTimeDomainData(this.audioData);
		{
			// Read audioData volumes.
			// Can also read from audio processing event.
			// let input = event.inputBuffer.getChannelData(0);
			let total = 0;
			for (let i = 0; i < this.audioData.length; i++) {
				total += Math.abs(this.audioData[i]);
			} 
			this.currentRMS = Math.sqrt(total / this.audioData.length);
		}

		this.autocorrolatedPitch = this.calcAutocorrolatedPitch();
		
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
			if (note.processed == true) {
				// This note is already processed.
				// console.log("Skipping processed node.");
				continue;
			}

			// This means the note is currently playing within its duration time. Process it once.
			note.processed = true;
			// console.log(note);

			const midiFrequency = UIUtils.midiNumberToFrequency(note.midi);
			// console.log("Note frequency: " + midiFrequency);
			
			//

			// TODO process input / audio against midi to see if we are playing matching notes on an instrument.

			//

			if (this.listenToMidi) {
				// oscillator for debugging. It can't start / stop twice, so recreate it.
				if (this.oscillator) {
					this.oscillator.disconnect(this.audioContext.destination);
				}
				this.oscillator = this.audioContext.createOscillator();
				this.oscillator.type = "sine";
				// this.oscillator.gain = 0.5;
				console.log(this.oscillator);
				this.oscillator.connect(this.audioContext.destination);
				this.oscillator.frequency.setTargetAtTime(midiFrequency, this.audioContext.currentTime, 0);
				this.oscillator.start(this.audioContext.currentTime);
				this.oscillator.stop(this.audioContext.currentTime + this.midi.header.ticksToSeconds(note.durationTicks));
			}
		}
	}

	calcAutocorrolatedPitch() {
		let maximaCount = 0;

		for (let l = 0; l < this.analyserNode.fftSize; l++) {
			this.corrolatedSignal[l] = 0;
			for (let i = 0; i < this.analyserNode.fftSize - l; i++) {
				this.corrolatedSignal[l] += this.audioData[i] * this.audioData[i + l];
			}
			if (l > 1) {
				if ((this.corrolatedSignal[l - 2] - this.corrolatedSignal[l - 1]) < 0
					&& (this.corrolatedSignal[l - 1] - this.corrolatedSignal[l]) > 0) {
					this.localMaxima[maximaCount] = (l - 1);
					maximaCount++;
					if ((maximaCount >= this.localMaxima.length)) {
						break;
					}
				}
			}
		}

		// Second: find the average distance in samples between maxima

		let maximaMean = this.localMaxima[0];

		for (let i = 1; i < maximaCount; i++) {
			maximaMean += this.localMaxima[i] - this.localMaxima[i - 1];
		}

		maximaMean /= maximaCount;

		return this.audioContext.sampleRate / maximaMean;
	}
}