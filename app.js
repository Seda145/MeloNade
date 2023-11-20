/**[[ Copyright Roy Wierer (Seda145) ]]**/

// External DOCS
// https://web.dev/articles/media-recording-audio
// https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3
// https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
// https://webaudio.github.io/web-audio-api/
// https://tonejs.github.io/
// https://github.com/Tonejs/Midi
// https://github.com/carter-thaxton/midi-file
// https://github.com/surikov/webaudiofont
// https://surikov.github.io/webaudiofont/examples/midiplayer.html#
// https://github.com/WebAudio/web-midi-api/issues/232
// https://stackoverflow.com/questions/41753349/convert-midi-file-to-list-of-notes-with-length-and-starting-time?rq=3
// https://forum.metasystem.io/forum/metagrid-pro/beta/issues/2981-c-2-c-1-midi-notes-lower-keyboard-range-question
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
// https://stackoverflow.com/questions/69237143/how-do-i-get-the-audio-frequency-from-my-mic-using-javascript
// https://newt.phys.unsw.edu.au/music/note/
// https://newt.phys.unsw.edu.au/jw/notes.html
// https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies


class UIUtils {
	static updateVisibility(inElem, bInShow) {
		if (!inElem) {
			console.log("UIUtils.updateVisibility: invalid inElem.");
			return;
		}
		if (bInShow) {
			inElem.classList.remove("hide");
		}
		else {
			inElem.classList.add("hide");
		}
	}

	static midiNumberToNoteLetter(inNumber) {
		const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
		const numberModulo = inNumber % 12;
		const note = notes[numberModulo];
		return note;
	}

	static midiNumberToFretNumber(inStringNumberOffset, inNumber) {
		// Note that this does not clamp the value to a positive number or to a max amount of frets.
		return inNumber - inStringNumberOffset;
	}

	static midiNumberToFrequency(inMidiNumber) {
		return Math.pow(2, (inMidiNumber - 69) / 12) * 440;
	}

	static frequencyToNearestMidiNumber(inFrequency) {
		return Math.round((12 * Math.log2(inFrequency / 440)) + 69);
	}
}

class Cache {
	constructor() {
		// Elements - Navigation
		this.eTabs = document.getElementById("tabs");
		this.eAllTabs = document.querySelectorAll("#tabs .tab");
		// Elements - DeveloperPage
		this.eDeveloperPage = document.getElementById("developer-page");
		this.eDeveloperPageForm = document.getElementById("developer-page-form");
		this.eInputDeveloperPageAudio = document.getElementById('input-developer-page-audio');
		this.ePlayerDeveloperPageAudio = document.getElementById('player-developer-page-audio');
		this.eInputDeveloperPageMidi = document.getElementById('input-developer-page-midi');
		this.eInputListenToMidi = document.getElementById('input-listen-to-midi');
		this.eInputDeveloperPageStopAudio = document.getElementById('input-developer-page-stop-audio');
		// Elements - DeveloperPage - SelectInstrument
		this.eInputSelectInstrument = document.getElementById('input-select-instrument');
		// Elements - DeveloperPage - ConfigInstruments
		this.eConfigInstrumentPanels = document.querySelectorAll('#developer-page-form .config-instrument-panel');
		// Elements - DeveloperPage - ConfigBassGuitar
		this.eInputConfigBassGuitar = document.getElementById('config-bass-guitar');
		this.eInputSelectBassGuitarTuning = document.getElementById('input-select-bass-guitar-tuning');
		this.eInputBassGuitarOrderStringsThickAtBottom = document.getElementById('input-bass-guitar-order-strings-thick-at-bottom');
		// Elements - ProcessingContent
		this.eProcessingContent = document.getElementById('processing-content');
		// Elements - BassGuitarVisualizer
		this.eBassGuitarVisualizer = document.getElementById('bass-guitar-visualizer');
		this.eBassGuitarTuningWrap = document.getElementById('bass-guitar-tuning-wrap');
		this.eBassGuitarStringsWrap = document.getElementById('bass-guitar-strings-wrap');
		this.eBassGuitarNotesWrap = document.getElementById('bass-guitar-notes-wrap');

		// Setup

		this.debugValidity();
	}

	debugValidity() {
		const bIsValid = (
			// Elements - Navigation
			this.eTabs
			&& this.eAllTabs
			// Elements - DeveloperPage
			&& this.eDeveloperPage
			&& this.eDeveloperPageForm 
			&& this.eInputDeveloperPageAudio 
			&& this.ePlayerDeveloperPageAudio 
			&& this.eInputDeveloperPageMidi 
			&& this.eInputListenToMidi 
			&& this.eInputDeveloperPageStopAudio 
			// Elements - DeveloperPage - SelectInstrument
			&& this.eInputSelectInstrument
			// Elements - DeveloperPage - ConfigInstruments
			&& this.eConfigInstrumentPanels.length == this.eInputSelectInstrument.options.length
			// Elements - DeveloperPage - ConfigBassGuitar
			&& this.eInputConfigBassGuitar
			&& this.eInputSelectBassGuitarTuning
			&& this.eInputBassGuitarOrderStringsThickAtBottom
			// Elements - ProcessingContent
			&& this.eProcessingContent 
			// Elements - BassGuitarVisualizer
			&& this.eBassGuitarVisualizer 
			&& this.eBassGuitarTuningWrap 
			&& this.eBassGuitarStringsWrap 
			&& this.eBassGuitarNotesWrap 
		);

		if (!bIsValid) {
			console.log("Elements are invalid!");
		}
	}
}


class AudioProcessor {
	constructor() {
		this.isPlaying = false;
		this.audioContext = new AudioContext();
		this.intervalResolution = 50;

		App.Cache.eInputDeveloperPageStopAudio.addEventListener(
			"click",
			(e) => {
				this.stopAudio();
			},
			false
		);

		App.Cache.eDeveloperPageForm.addEventListener(
			"submit",
			async (e) => {
				e.preventDefault();

				console.log("Setting audio source.");
				const audioFile = App.Cache.eInputDeveloperPageAudio.files[0];
				if (!audioFile) {
					console.log("Invalid audio source.");
					return;
				}
				const audioUrl = URL.createObjectURL(audioFile);
				App.Cache.ePlayerDeveloperPageAudio.src = audioUrl;
				App.Cache.ePlayerDeveloperPageAudio.load();

				console.log("Loading MIDI object.");
				const midiFile = App.Cache.eInputDeveloperPageMidi.files[0];
				const midiUrl = URL.createObjectURL(midiFile);
				this.midi = await Midi.fromUrl(midiUrl);

				if (!this.midi) {
					console.log("Invalid midi source.");
					return;
				}
				if (this.midi.tracks.length != 1) {
					console.log("The amount of midi tracks must be 1.");
					return;
				}
				console.log(this.midi);

				this.restartAudio();
			},
			false
		);
	}

	restartAudio() {
		this.stopAudio();
		console.log("Starting audio");
		this.isPlaying = true;

		App.Cache.ePlayerDeveloperPageAudio.play();
		this.ProcessMIDIWithAudioSyncInterval = setInterval(() => { this.ProcessMIDIWithAudioSync() }, this.intervalResolution);

		const restartAudioEvent = new Event('restart-audio', { bubbles: false });
		App.Cache.ePlayerDeveloperPageAudio.dispatchEvent(restartAudioEvent);
	}

	stopAudio() {
		if (!this.isPlaying) {
			return;
		}
		console.log("Stopping audio");
		App.Cache.ePlayerDeveloperPageAudio.currentTime = 0;
		App.Cache.ePlayerDeveloperPageAudio.pause();
		clearInterval(this.ProcessMIDIWithAudioSyncInterval);
		this.isPlaying = false;

		const stopAudioEvent = new Event('stop-audio', { bubbles: false });
		App.Cache.ePlayerDeveloperPageAudio.dispatchEvent(stopAudioEvent);
	}

	ProcessMIDIWithAudioSync() {
		// Since clocks are not accurate the current MIDI tick should be synced to audio playtime.
		// To get a position in midi ticks from playback seconds, we can use methods in the midi header class.
		// https://stackoverflow.com/questions/2038313/converting-midi-ticks-to-actual-playback-seconds
		// console.log(midi.header.secondsToTicks(2));
		// TODO: Optimize this somehow. Perhaps reformat the data to be keyed to time.	
		// TODO: Assumed is the MIDI comes with 1 track only.	
		const currentTime = App.Cache.ePlayerDeveloperPageAudio.currentTime;
		const timeAsTick = this.midi.header.secondsToTicks(currentTime);
		// console.log("Current play time: " + currentTime + ". timeAsTick: " + timeAsTick);
		// console.log(this.midi.tracks[0].notes);
		
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
			console.log(note);

			const midiFrequency = UIUtils.midiNumberToFrequency(note.midi);
			console.log("Note frequency: " + midiFrequency);
			
			//

			// TODO process input / audio against midi to see if we are playing matching notes on an instrument.

			//

			if (App.Cache.eInputListenToMidi.checked) {
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
}


class CreationForm {
	constructor() {
		// Override form submit.
		App.Cache.eDeveloperPageForm.addEventListener(
			"submit",
			(e) => {
				e.preventDefault();

				// const formData = new FormData(e.target);
			},
			false
		);

		App.Cache.eInputSelectInstrument.addEventListener(
			"change",
			(e) => {
				e.preventDefault();
				this.updateConfigInstrumentPanels();
			},
			false
		);

		this.updateConfigInstrumentPanels();
	}

	updateConfigInstrumentPanels() {
		const choice = App.Cache.eInputSelectInstrument.value;
		console.log("eInputSelectInstrument value: " + choice);

		App.Cache.eConfigInstrumentPanels.forEach((inElemX) => {
			UIUtils.updateVisibility(inElemX, false);
		});

		if (choice == "bass-guitar") {
			UIUtils.updateVisibility(App.Cache.eInputConfigBassGuitar, true);
		}
	}
}


class AudioAnalyzer {
	constructor() {
		this.audioContext = new AudioContext();
		this.canvas = document.getElementById("audio-analyzer-canvas");

		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 2048;
		// this.analyser.smoothingTimeConstant = 0.1;
		this.bufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);
		this.analyser.getByteTimeDomainData(this.dataArray);
		this.audioData = new Float32Array(this.analyser.fftSize);
		this.corrolatedSignal = new Float32Array(this.analyser.fftSize);
		this.localMaxima = new Array(3);
		this.eInputPitchDetectionTargetLetter = document.getElementById('pitch-detection-target-letter');
		
		navigator.mediaDevices.getUserMedia({ video: false, audio: true })
		.then((stream) => {
			this.source = this.audioContext.createMediaStreamSource(stream);
			this.source.connect(this.analyser);
		}).catch((err) => {
			console.error(`${err.name}: ${err.message}`);
		});

		// Connect the source to be analysed
		// Get a canvas defined with ID "oscilloscope"
		this.canvasCtx = this.canvas.getContext("2d");

		App.Cache.ePlayerDeveloperPageAudio.addEventListener(
			"restart-audio",
			async (e) => {
				e.preventDefault();
				this.start();
			},
			false
		);

		App.Cache.ePlayerDeveloperPageAudio.addEventListener(
			"stop-audio",
			(e) => {
				e.preventDefault();
				this.stop();
			},
			false
		);
	}

	start() {
		this.drawInterval = setInterval(() => {
			this.analyser.getFloatTimeDomainData(this.audioData);

			const pitch = this.getAutocorrolatedPitch();
			const midiNumber = UIUtils.frequencyToNearestMidiNumber(pitch);
			const noteLetter = UIUtils.midiNumberToNoteLetter(midiNumber);

			this.eInputPitchDetectionTargetLetter.innerHTML = `${noteLetter}`;
		}, 20);

		this.draw();
	}

	draw() {
		// draw an oscilloscope of the current audio source
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });

		this.analyser.getByteTimeDomainData(this.dataArray);

		this.canvasCtx.fillStyle = "rgb(200, 200, 200)";
		this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.canvasCtx.lineWidth = 2;
		this.canvasCtx.strokeStyle = "rgb(0, 0, 0)";

		this.canvasCtx.beginPath();

		const sliceWidth = (this.canvas.width * 1.0) / this.bufferLength;
		let x = 0;
		for (let i = 0; i < this.bufferLength; i++) {
			const v = this.dataArray[i] / 128.0;
			const y = (v * this.canvas.height) / 2;

			if (i === 0) {
				this.canvasCtx.moveTo(x, y);
			} 
			else {
				this.canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
		this.canvasCtx.stroke();
	}

	stop() {
		clearInterval(this.drawInterval);
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	getAutocorrolatedPitch() {
		// First: autocorrolate the signal

		let maximaCount = 0;

		for (let l = 0; l < this.analyser.fftSize; l++) {
			this.corrolatedSignal[l] = 0;
			for (let i = 0; i < this.analyser.fftSize - l; i++) {
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


class BassGuitarVisualizer {
	constructor() {
		/* State */
		this.widthMultiplier = 100;
		this.widthOfNoteBar = 0;
		this.pxPerTick = 0;
		this.pxPerSecond = 0;
		this.endOfTrackTicks = 0;
		this.endOfTrackSeconds = 0;
		/* Elements */
		this.eBassGuitarVisualizerNoteBars = [];

		App.Cache.ePlayerDeveloperPageAudio.addEventListener(
			"restart-audio",
			(e) => {
				e.preventDefault();
				this.restart();
			},
			false
		);

		App.Cache.ePlayerDeveloperPageAudio.addEventListener(
			"stop-audio",
			(e) => {
				e.preventDefault();
				this.stop();
			},
			false
		);
	}

	restart() {
		console.log("restarting visualizer.");
		
		// regenerate all notes on the visualizer.

		this.endOfTrackTicks = App.AudioProcessor.midi.tracks[0].endOfTrackTicks;
		this.endOfTrackSeconds = App.AudioProcessor.midi.header.ticksToSeconds(this.endOfTrackTicks);
		// Calculate the visual width of the note bar by the length of the audio. Tick rate varies per midi, so seconds are calculated.
		this.widthOfNoteBar = this.endOfTrackSeconds * this.widthMultiplier;
		// console.log("width of note bar: " + this.widthOfNoteBar);
		this.pxPerTick = this.widthOfNoteBar / this.endOfTrackTicks;
		this.pxPerSecond = this.pxPerTick * this.endOfTrackTicks / this.endOfTrackSeconds;
		// console.log("Pixels per note tick: " + this.pxPerTick);

		// Clear html that will be regenerated.
		App.Cache.eBassGuitarTuningWrap.innerHTML = "";
		App.Cache.eBassGuitarStringsWrap.innerHTML = "";
		App.Cache.eBassGuitarNotesWrap.innerHTML = "";

		// Some data from the configuration such as tuning has to be collected and written to elements.
		let tuningLetterHTMLArr = [];
		let stringsHTMLArr = [];
		let noteTrackHTMLArr = [];
		const stringMidiOffsets = App.Cache.eInputSelectBassGuitarTuning.value.split(",");
		for (let x = 0; x < stringMidiOffsets.length; x++) {
			const stringNumberX = x + 1;
			const stringOffsetX = stringMidiOffsets[x];

			tuningLetterHTMLArr.push('<span class="bass-guitar-tuning-letter" data-string-number="' + stringNumberX + '">' + UIUtils.midiNumberToNoteLetter(stringOffsetX) + '</span>');
			stringsHTMLArr.push('<div class="bass-guitar-string-line" data-string-number="' + stringNumberX + '"></div>');
			noteTrackHTMLArr.push('<div class="bass-guitar-note-bar" data-midi-offset="' + stringOffsetX + '" data-string-number="' + stringNumberX  + '"></div>');
		}
		if (App.Cache.eInputBassGuitarOrderStringsThickAtBottom.checked) {
			tuningLetterHTMLArr.reverse();
			stringsHTMLArr.reverse();
			noteTrackHTMLArr.reverse();
		}
		const tuningLetterHTML = tuningLetterHTMLArr.join("");
		const stringsHTML = stringsHTMLArr.join("");
		const noteTrackHTML = noteTrackHTMLArr.join("");

		App.Cache.eBassGuitarTuningWrap.insertAdjacentHTML('afterbegin', tuningLetterHTML);
		App.Cache.eBassGuitarStringsWrap.insertAdjacentHTML('afterbegin', stringsHTML);
		App.Cache.eBassGuitarNotesWrap.insertAdjacentHTML('afterbegin', noteTrackHTML);
		// Store the generated note bars for later use.
		this.eBassGuitarVisualizerNoteBars = document.querySelectorAll('#bass-guitar-notes-wrap .bass-guitar-note-bar');

		// For every bar we collect html to display notes.
		let notesHTML = {};
		this.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			notesHTML[inElemX.dataset.midiOffset] = [];
		});
		
		for (let i = 0; i < App.AudioProcessor.midi.tracks[0].notes.length; i++) {
			const note = App.AudioProcessor.midi.tracks[0].notes[i];
			const endNoteTick = note.ticks + note.durationTicks;
			const notePosition = note.ticks * this.pxPerTick;
			const noteWidth = (endNoteTick - note.ticks) * this.pxPerTick;
			
			// Figure out which bar is best to display the note on.
			const midiNumber = note.midi;
			let smallestDistance = 128;
			// The string tuned to be the closest to the desired note.
			let optimalKey = -1;

			for (const [key, value] of Object.entries(notesHTML)) {
				if (midiNumber < key) {
					// We can't play lower than a 0 on the string.
					continue;
				}
				const difference = midiNumber - key;
				if (difference < smallestDistance) {
					optimalKey = key;
					smallestDistance = difference;
				}
			}
			if (!notesHTML[optimalKey]) {
				console.log("Error! Did not get an optimal offset for midi note on the note bar.");
				return;
			}

			notesHTML[optimalKey] += '<div class="bass-guitar-note" style="left: ' + notePosition + 'px; width: ' + noteWidth + 'px;"><span>' + UIUtils.midiNumberToFretNumber(optimalKey, note.midi) + '</span></div>';
		}

		// Write the note bars html.
		let processedOffsets = [];

		this.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			const offsetX = inElemX.dataset.midiOffset;
			if (processedOffsets.includes(offsetX)) {
				console.log("The offset specified on this element has already been processed to calculate note positions. Two strings can not be tuned to the same value.");
			}
			else {
				inElemX.insertAdjacentHTML('afterbegin', notesHTML[offsetX])
				processedOffsets.push(inElemX.dataset.midiOffset);
			}
		});

		// Set the default track width and position.
		this.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			inElemX.style.width = this.widthOfNoteBar + 'px';
		});
		App.Cache.eBassGuitarNotesWrap.style.left = '0px';
		
		// Start 'playing' visuals.
		this.refreshInterval = setInterval(() => { this.refresh() }, App.msForfps);
	}
	
	stop() {
		console.log("stopping visualizer.");
		clearInterval(this.refreshInterval);
	}

	refresh() {
		console.log("refreshing visualizer.");
		// Move the absolute position of all notes from start to end, based on current play time of the audio.
		const currentAudioTime = App.Cache.ePlayerDeveloperPageAudio.currentTime;
		const noteBarPosition = currentAudioTime * this.pxPerSecond;
		// TODO this is choppy movement?
		// App.Cache.eBassGuitarNotesWrap.style.left = -noteBarPosition + 'px';
		this.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			inElemX.style.transform = 'translatex(' + -noteBarPosition + 'px)';
		});
	}

	// Assuming Standard E on bass guitar: E1 A1 D2 G2
	// https://forum.metasystem.io/forum/metagrid-pro/beta/issues/2981-c-2-c-1-midi-notes-lower-keyboard-range-question
}


class Navigation {
	constructor() {
		// Listen to when a tab is clicked. On click, navigate to its content id.
		App.Cache.eAllTabs.forEach((inElemX) => {
			inElemX.addEventListener(
				"click",
				(e) => {
					this.navigateTo(e.target.dataset.contentid);
				}
			);
		});
	}

	navigateTo(InContentId) {
		console.log("Navigation to: " + InContentId);
		switch (Number(InContentId)) {
			case 0:
				UIUtils.updateVisibility(App.Cache.eDeveloperPage, true);
				UIUtils.updateVisibility(App.Cache.eProcessingContent, false);
				break;
			case 1:
				UIUtils.updateVisibility(App.Cache.eDeveloperPage, false);
				UIUtils.updateVisibility(App.Cache.eProcessingContent, true);
				break;
			default:
				console.log("Navigation error, this contentId is not used.");
				return;
		}

		let activeTab = App.Cache.eTabs.querySelector(".tab.active");
		if (activeTab) {
			activeTab.classList.remove("active");
		}
		let newTab = App.Cache.eTabs.querySelector('.tab[data-contentid="' + InContentId + '"]');
		if (newTab) {
			newTab.classList.add("active");
		}

		// console.log("Navigated to InContentId: " + InContentId);
	}
}


class MyApp {
	constructor() {
		this.fps = 60;
		this.msForfps = 1 / this.fps * 1000;
	}

	startModule() {
		// Cache
		this.Cache = new Cache();
		// Register system modules
		this.AudioProcessor = new AudioProcessor();
		// Register the forms
		this.CreationForm = new CreationForm();
		// Analyzers
		this.AudioAnalyzer = new AudioAnalyzer();
		// Visualizer
		this.BassGuitarVisualizer = new BassGuitarVisualizer();
		// Navigation.
		this.Navigation = new Navigation();
		this.Navigation.navigateTo(0);
	}
}


const App = new MyApp();
App.startModule();