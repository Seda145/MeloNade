/**[[ Copyright Roy Wierer (Seda145) ]]**/

// External DOCS
// https://web.dev/articles/media-recording-audio
// https://stackoverflow.com/questions/69237143/how-do-i-get-the-audio-frequency-from-my-mic-using-javascript
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
}


class AudioProcessor {
	constructor() {
		this.isPlaying = false;
		this.audioContext = new AudioContext();

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
		this.DebugMIDIWithAudioSyncInterval = setInterval(() => { this.DebugMIDIWithAudioSync() }, 50 );

		let restartAudioEvent = new Event('restart-audio', { bubbles: false });
		App.Cache.ePlayerDeveloperPageAudio.dispatchEvent(restartAudioEvent);
	}

	stopAudio() {
		if (!this.isPlaying) {
			return;
		}
		console.log("Stopping audio");
		App.Cache.ePlayerDeveloperPageAudio.currentTime = 0;
		App.Cache.ePlayerDeveloperPageAudio.pause();
		clearInterval(this.DebugMIDIWithAudioSyncInterval);
		this.isPlaying = false;

		let stopAudioEvent = new Event('stop-audio', { bubbles: false });
		App.Cache.ePlayerDeveloperPageAudio.dispatchEvent(stopAudioEvent);
	}

	DebugMIDIWithAudioSync() {
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

			const midiFrequency = Math.pow(2, (note.midi - 69) / 12) * 440;
			console.log("Note frequency: " + midiFrequency);
			
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
		this.eInputDeveloperPageStopAudio = document.getElementById('input-developer-page-stop-audio');
		// Elements - ProcessingContent
		this.eProcessingContent = document.getElementById('processing-content');
		// Elements - BassGuitarVisualizer
		this.eBassGuitarVisualizer = document.getElementById('bass-guitar-visualizer');
		this.eBassGuitarNotesWrap = document.getElementById('bass-guitar-notes-wrap');
		this.eBassGuitarVisualizerNoteBars = document.querySelectorAll('#bass-guitar-notes-wrap .bass-guitar-note-bar');

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
			&& this.eInputDeveloperPageStopAudio 
			// Elements - ProcessingContent
			&& this.eProcessingContent 
			// Elements - BassGuitarVisualizer
			&& this.eBassGuitarVisualizer 
			&& this.eBassGuitarNotesWrap 
			&& this.eBassGuitarVisualizerNoteBars.length == 4
		);

		if (!bIsValid) {
			console.log("Elements are invalid!");
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
	}
}


class BassGuitarVisualizer {
	constructor() {
		this.widthMultiplier = 100;
		this.widthOfNoteBar = 0;
		this.pxPerTick = 0;
		this.pxPerSecond = 0;
		this.endOfTrackTicks = 0;
		this.endOfTrackSeconds = 0;

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

		// Set the base style.
		App.Cache.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			inElemX.style.width = this.widthOfNoteBar + 'px';
		});
		App.Cache.eBassGuitarNotesWrap.style.left = '0px';

		// Clear the html for the notes bar, we will regenerate the data.
		App.Cache.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			inElemX.innerHTML = "";
		});
		// For every bar we collect html.
		let notesHTML = {};
		App.Cache.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
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

			notesHTML[optimalKey] += '<div class="bass-guitar-note" style="left: ' + notePosition + 'px; width: ' + noteWidth + 'px;"><span>' + note.midi + '</span></div>';
		}

		// Write the note bars html.
		App.Cache.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
			inElemX.insertAdjacentHTML('afterbegin', notesHTML[inElemX.dataset.midiOffset])
		});

		// Start 'playing' visuals.
		this.refreshInterval = setInterval(() => { this.refresh() }, 1 / App.fps * 1000);
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
		App.Cache.eBassGuitarVisualizerNoteBars.forEach((inElemX) => {
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
		this.fps = 120;
	}

	startModule() {
		// Cache
		this.Cache = new Cache();
		// Register system modules
		this.AudioProcessor = new AudioProcessor();
		// Register the forms
		this.CreationForm = new CreationForm();
		// Visualizer
		this.BassGuitarVisualizer = new BassGuitarVisualizer();
		// Navigation.
		this.Navigation = new Navigation();
		this.Navigation.navigateTo(0);
	}
}


const App = new MyApp();
App.startModule();