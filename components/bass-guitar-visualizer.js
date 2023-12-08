/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class BassGuitarVisualizer {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="bass-guitar-visualizer"]'), this.getHTMLTemplate());
		this.eNoteBars = [];
		this.eTuningWrap = this.element.querySelector('.tuning-wrap');
		this.eStringsWrap = this.element.querySelector('.strings-wrap');
		this.eNotesWrap = this.element.querySelector('.notes-wrap');
        /* State */
		this.movePixelsPerSecond = 300;

        window.addEventListener(
			"audio-processor-start-song",
			(e) => {
				e.preventDefault();
				this.start();
			},
			false
		);

		window.addEventListener(
			"audio-processor-stop-song",
			(e) => {
				e.preventDefault();
				this.stop();
			},
			false
		);

		window.addEventListener(
			"audio-processor-hit-note",
			(e) => {
				e.preventDefault();
				// console.log("response to hit note:");
				// console.log(e.note);

				let eCurrentNote = this.eNotesWrap.querySelector('.note[data-note-index="' + e.noteIndex + '"]');
				if (!eCurrentNote) {
					console.error("no matching note element found for processed note with index: " + e.noteIndex);
					return;
				} 
				eCurrentNote.classList.add("hit");
			},
			false
		);
	}
	
    start() {
		console.log("restarting visualizer.");
		
		// regenerate all notes on the visualizer.

		// Clear html that will be regenerated.
		this.eTuningWrap.innerHTML = "";
		this.eStringsWrap.innerHTML = "";
		this.eNotesWrap.innerHTML = "";

		// Some data from the configuration such as tuning has to be collected and written to elements.
		let tuningLetterHTMLArr = [];
		let stringsHTMLArr = [];
		let noteTrackHTMLArr = [];
		const stringMidiOffsets = app.userdata.data.activeProfile.config.instruments["bass-guitar"].tuning.split(",");

		for (let x = 0; x < stringMidiOffsets.length; x++) {
			const stringNumberX = x + 1;
			const stringOffsetX = stringMidiOffsets[x];

			tuningLetterHTMLArr.push('<span class="tuning-letter" data-string-number="' + stringNumberX + '">' + MidiUtils.midiNumberToNoteLetter(stringOffsetX) + '</span>');
			stringsHTMLArr.push('<div class="string-line" data-string-number="' + stringNumberX + '"></div>');
			noteTrackHTMLArr.push('<div class="note-bar" data-midi-offset="' + stringOffsetX + '" data-string-number="' + stringNumberX  + '"></div>');
		}
		if (app.userdata.data.activeProfile.config.instruments["bass-guitar"].orderStringsThickAtBottom == "true") {
			tuningLetterHTMLArr.reverse();
			stringsHTMLArr.reverse();
			noteTrackHTMLArr.reverse();
		}
		const tuningLetterHTML = tuningLetterHTMLArr.join("");
		const stringsHTML = stringsHTMLArr.join("");
		const noteTrackHTML = noteTrackHTMLArr.join("");

		this.eTuningWrap.insertAdjacentHTML('afterbegin', tuningLetterHTML);
		this.eStringsWrap.insertAdjacentHTML('afterbegin', stringsHTML);
		this.eNotesWrap.insertAdjacentHTML('afterbegin', noteTrackHTML);
		// Store the generated note bars for later use.
		this.eNoteBars = this.eNotesWrap.querySelectorAll('.note-bar');

		// For every bar we collect html to display notes.
		let notesHTML = {};
		this.eNoteBars.forEach((inElemX) => {
			notesHTML[inElemX.dataset.midiOffset] = [];
		});
		
		for (let i = 0; i < app.audioProcessor.midi.tracks[app.audioProcessor.midiTrackIndex].notes.length; i++) {
			const note = app.audioProcessor.midi.tracks[app.audioProcessor.midiTrackIndex].notes[i];
			const notePositionSeconds = app.audioProcessor.midi.header.ticksToSeconds(note.ticks);
			const notePosition = notePositionSeconds * this.movePixelsPerSecond;
			const noteDurationSeconds = app.audioProcessor.midi.header.ticksToSeconds(note.durationTicks);
			const minNoteWidth = Math.round(noteDurationSeconds * this.movePixelsPerSecond);

			// Figure out which bar is best to display the note on.
			const midiNumber = note.midi;
			let smallestDistance = 999;
			// The string tuned to be the closest to the desired note.
			let optimalKey = null;

			// For every "string" (note bar), where key is the tuning of the string and value the html.
			for (const [key, value] of Object.entries(notesHTML)) {
				const stringMidiOffset = parseInt(key);
				if (midiNumber < stringMidiOffset) {
					// We can't play lower than a 0 on the string.
					continue;
				}
				const difference = midiNumber - stringMidiOffset;
				if (difference < smallestDistance) {
					optimalKey = key;
					smallestDistance = difference;
				}
			}
			if (optimalKey != null) {
				notesHTML[optimalKey] += '<div class="note" data-note-index="' + i + '" style="left: ' + notePosition + 'px; min-width: ' + minNoteWidth + 'px;"><span>' + MidiUtils.midiNumberToFretNumber(optimalKey, note.midi) + '</span></div>';
			}
			else {
				console.warn("Could not find a position on any notebar for this note, within the current offsets (instrument tuning). Midi number: " + midiNumber + ", as note letter: " + MidiUtils.midiNumberToNoteLetter(midiNumber) + ", note index: " + i);
			}
		}

		// Write the note bars html.
		let processedOffsets = [];

		this.eNoteBars.forEach((inElemX) => {
			const offsetX = inElemX.dataset.midiOffset;
			if (processedOffsets.includes(offsetX)) {
				console.error("The offset specified on this element has already been processed to calculate note positions. Two strings can not be tuned to the same value.");
			}
			else {
				inElemX.insertAdjacentHTML('afterbegin', notesHTML[offsetX])
				processedOffsets.push(inElemX.dataset.midiOffset);
			}
		});

		// Set the default track width and position.
		// I specifically don't use the duration (endOfTrackTicks) of the midi track because of an issue with https://github.com/Tonejs/Midi/issues/187
		const widthOfNoteBar = Math.round(app.audioProcessor.audio.duration * this.movePixelsPerSecond);
		this.eNoteBars.forEach((inElemX) => {
			inElemX.style.width = widthOfNoteBar + 'px';
		});
		this.eNotesWrap.style.left = '0px';
		
		// Start 'playing' visuals.
		this.draw();
	}
	
	stop() {
		console.log("stopping visualizer.");
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	draw() {
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });

		if (!app.audioProcessor.audio) {
			console.error("audioProcessor.audio is invalid.");
			return;
		}
		// console.log("refreshing visualizer.");
		// Move the absolute position of all notes from start to end, based on current play time of the audio.
		const currentAudioTime = app.audioProcessor.audio.currentTime;
		const noteBarPosition = currentAudioTime * this.movePixelsPerSecond;
		// TODO this is choppy movement?
		// this.eNotesWrap.style.left = -noteBarPosition + 'px';
		this.eNoteBars.forEach((inElemX) => {
			inElemX.style.transform = 'translatex(' + -noteBarPosition + 'px)';
		});
	}

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`

 
<div class="bass-guitar-visualizer color-string">
    <div class="tuning-wrap"></div>

    <div class="note-visualizer">
        <div class="strings-wrap"></div>
        <div class="notes-wrap"></div>
    </div>
</div>

        `);
    }
}