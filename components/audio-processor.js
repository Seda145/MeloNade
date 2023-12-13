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
		this.micGainNode = null;
		this.micAudioBuffer = null;
		this.corrolatedSignal = null;
		this.localMaxima = null;
		this.minRelevantRMS = 0.015;
		this.currentRMS = 0;
		this.autocorrolatedPitch = 0;
        this.bUpdatedAutocorrelatedPitch = false;
        this.songTitle = null;
        this.micSource = null;
		this.audio = null;
		this.midi = null;
        this.midiTrackIndex = 0;
        this.currentNote = null;
        this.currentNoteIndex = 0;
        this.countMissedNotes = 0;
        this.countHitNotes = 0;
        this.countHitAccuracy = 0;
        this.countHitTotalPercentage = 0;
        this.countHitStreak = 0;
        // Cents tolerance can help if detection is innacurate.
        this.hitDetectionCentsTolerance = 40;
        this.currentCentsDifferenceFromNote = 0;
	}

    async requestMicDevice() {
        if (this.micAudioBuffer != null) {
            // Don't ask twice?
            return;
        }

        // https://webaudio.github.io/web-audio-api/
        navigator.mediaDevices.getUserMedia({ 
            video: false, 
            audio: true,
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0,
            channelCount: 1

        })
        .then((stream) => {
            console.log("Starting audio");

            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 2048;
            this.bufferLength = this.analyserNode.fftSize;
            this.micAudioBuffer = new Float32Array(this.bufferLength);
            this.corrolatedSignal = new Float32Array(this.analyserNode.fftSize);
            this.localMaxima = new Array(4);
            // Chain: Microphone > Gain > Analyser
            this.micGainNode = this.audioContext.createGain();
            this.micSource = this.audioContext.createMediaStreamSource(stream);
            this.micSource.connect(this.micGainNode);
            this.micGainNode.connect(this.analyserNode);

            setInterval(() => { this.analyseMic() }, this.intervalResolution);
            // Calculate initial buffer values.
            this.analyseMic();

            let connectedMicEvent = new Event('audioprocessor-connected-mic', { bubbles: false });
            window.dispatchEvent(connectedMicEvent);
        }).catch((err) => {
            console.error(`${err.name}: ${err.message}`);
            console.error("Could not find a microphone.");
            alert("Something went wrong starting the audio, is your microphone enabled?");
        });
    }

    analyseMic() {
        this.analyserNode.getFloatTimeDomainData(this.micAudioBuffer);

        // Update RMS value (volume).
        {
            let sum = 0;
            for (let i = 0; i < this.bufferLength; i++) {
                const val = this.micAudioBuffer[i];
                sum += val * val;
            }
            this.currentRMS = Math.sqrt(sum / this.bufferLength);
            // console.log(this.currentRMS);
		}

        // autocorrelate pitch.
        this.bUpdatedAutocorrelatedPitch = false;
        if (this.currentRMS > this.minRelevantRMS) {
            // https://github.com/cwilso/PitchDetect/blob/main/js/pitchdetect.js
            // This method is borrowed from the above library, which has the MIT license.
            /*
            The MIT License (MIT)

            Copyright (c) 2014 Chris Wilson

            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:

            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.

            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
            */

            // Implements the ACF2+ algorithm
            let bufferCopy = this.micAudioBuffer;
        
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
                this.bUpdatedAutocorrelatedPitch = true;
            }
            else {
                // console.warn("Pitch not properly set. (rms too low?)");
            }
        }
    }

	async startSong(inSongData, inMidiTrackIndex) {
        // First stop if required.
		this.stopSong();

        // If we don't have one already.
        await this.requestMicDevice();

        if (this.micAudioBuffer == null) {
            alert("Microphone data could not be retrieved.");
            return;
        }

        this.songTitle = inSongData.title;
        this.audio = new Audio(URL.createObjectURL(inSongData.audio));
        // https://github.com/Tonejs/Midi
        this.midi = await Midi.fromUrl(URL.createObjectURL(inSongData.midi));
        this.midiTrackIndex = inMidiTrackIndex;

        this.audio.addEventListener("loadeddata", () => {
            if (!this.songTitle || !this.audio || !this.midi || !this.midi.tracks) {
                console.error("Invalid song data.");
                return;
            }

            this.audio.volume = parseFloat(app.userdata.data.activeProfile.config.audioVolume);
    
            console.log("Midi as object:");
            console.log(this.midi);
            console.log("The index of the midi track that will be used is: " + this.midiTrackIndex);

            this.currentNote = null;
            this.currentNoteIndex = 0;
            this.countMissedNotes = 0;
            this.countHitNotes = 0;
            this.countHitAccuracy = 0;
            this.countHitTotalPercentage = 0;
            this.countHitStreak = 0;
    
            this.audio.play();
            this.isPlaying = true;
            this.ProcessMIDIWithAudioSyncInterval = setInterval(() => { this.ProcessMIDIWithAudioSync() }, this.intervalResolution);
    
            const startSongEvent = new Event('audio-processor-start-song', { bubbles: false });
            window.dispatchEvent(startSongEvent);
        });
    }

	stopSong() {
		if (!this.isPlaying) {
			return;
		}
		console.log("Stopping audio");
		if (this.audio) {
			this.audio.pause();
		}
		clearInterval(this.ProcessMIDIWithAudioSyncInterval);
		this.isPlaying = false;
		const stopSongEvent = new Event('audio-processor-stop-song', { bubbles: false });
		window.dispatchEvent(stopSongEvent);
	}

	ProcessMIDIWithAudioSync() {
        const currentTime = this.audio.currentTime;
        if (currentTime == this.audio.duration) {
            // Reached the end.
            console.log("Reached end of song. Stopping.");
            this.stopSong();
        }
        const timeAsTick = this.midi.header.secondsToTicks(currentTime);
        // Collect current audio data.
        // console.log("Current play time: " + currentTime + ". timeAsTick: " + timeAsTick);
        // console.log(this.midi.tracks[this.midiTrackIndex].notes);

 
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
            for (; this.currentNoteIndex < this.midi.tracks[this.midiTrackIndex].notes.length; this.currentNoteIndex++) {
                this.currentNote = this.midi.tracks[this.midiTrackIndex].notes[this.currentNoteIndex];

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
                let oldNote = this.midi.tracks[this.midiTrackIndex].notes[i];
                if (typeof oldNote.bHit !== 'undefined') {
                    break;
                }
                oldNote.bHit = false;
                this.countMissedNotes++;
                this.countHitStreak = 0;
                // if total is 0, return 0 to avoid division by 0. The decimals on the calculated hit accuracy are removed.
                this.countHitAccuracy = (this.countHitNotes + this.countMissedNotes != 0 ? (this.countHitNotes / (this.countMissedNotes + this.countHitNotes) * 100) : 0).toFixed(0);
                this.countHitTotalPercentage = (this.countHitNotes / this.midi.tracks[this.midiTrackIndex].notes.length * 100).toFixed(0);
                let missedNoteEvent = new Event('audio-processor-missed-note', { bubbles: false });
                missedNoteEvent.noteIndex = i;
                window.dispatchEvent(missedNoteEvent);
            }
        }
        
        if (app.userdata.data.activeProfile.config.listenToMidi == "true" && this.currentNote != null && !this.currentNote.playedByOscillator) {
            // https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3
            const midiFrequency = MidiUtils.midiNumberToFrequency(this.currentNote.midi);
            // console.log("Note frequency: " + midiFrequency);
    
            // oscillator for debugging. It can't start / stop twice, so recreate it.
            if (this.oscillator) {
                this.oscillator.disconnect(this.audioContext.destination);
            }
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = "sine";
            // console.log(this.oscillator);
            this.oscillator.connect(this.audioContext.destination);
            this.oscillator.frequency.setTargetAtTime(midiFrequency, this.audioContext.currentTime, 0);
            this.oscillator.start(this.audioContext.currentTime);
            this.oscillator.stop(this.audioContext.currentTime + this.midi.header.ticksToSeconds(this.currentNote.durationTicks));
            this.currentNote.playedByOscillator = true;
        }

        // Process the MIDI data against the current audio data (microphone), to see if we find matching frequencies (like playing guitar along to music).
        if (this.bUpdatedAutocorrelatedPitch && this.currentNote != null) {
            this.currentCentsDifferenceFromNote = MidiUtils.centsOffFromPitch(this.autocorrolatedPitch, this.currentNote.midi);

            // console.log(this.currentNote);

            // Only need to register the hit once.
            if (!this.currentNote.bHit) {
                if (Math.abs(this.currentCentsDifferenceFromNote) <= this.hitDetectionCentsTolerance) {
                    // Note that we don't register a miss here, only a hit. A miss is irrelevant since we can make a hit at any time while the note plays.
                    this.currentNote.bHit = true;
                    // console.log("Hit note: " + this.currentNoteIndex);
                    this.countHitNotes++;
                    this.countHitStreak++;
                    // if total is 0, return 0 to avoid division by 0. The decimals on the calculated hit accuracy are removed.
                    this.countHitAccuracy = (this.countHitNotes + this.countMissedNotes != 0 ? (this.countHitNotes / (this.countMissedNotes + this.countHitNotes) * 100) : 0).toFixed(0);
                    this.countHitTotalPercentage = (this.countHitNotes / this.midi.tracks[this.midiTrackIndex].notes.length * 100).toFixed(0);
                    let hitNoteEvent = new Event('audio-processor-hit-note', { bubbles: false });
                    hitNoteEvent.noteIndex = this.currentNoteIndex;
                    window.dispatchEvent(hitNoteEvent);
                }
            }
        }
	}
}