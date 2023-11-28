/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class BassGuitarVisualizer {
    restart() {
		console.log("restarting visualizer.");
		
		// regenerate all notes on the visualizer.

		this.endOfTrackTicks = app.audioProcessor.midi.tracks[0].endOfTrackTicks;
		this.endOfTrackSeconds = app.audioProcessor.midi.header.ticksToSeconds(this.endOfTrackTicks);
		// Calculate the visual width of the note bar by the length of the audio. Tick rate varies per midi, so seconds are calculated.
		this.widthOfNoteBar = this.endOfTrackSeconds * this.widthMultiplier;
		// console.log("width of note bar: " + this.widthOfNoteBar);
		this.pxPerTick = this.widthOfNoteBar / this.endOfTrackTicks;
		this.pxPerSecond = this.pxPerTick * this.endOfTrackTicks / this.endOfTrackSeconds;
		// console.log("Pixels per note tick: " + this.pxPerTick);

		// Clear html that will be regenerated.
		this.eTuningWrap.innerHTML = "";
		this.eStringsWrap.innerHTML = "";
		this.eNotesWrap.innerHTML = "";

		// Some data from the configuration such as tuning has to be collected and written to elements.
		let tuningLetterHTMLArr = [];
		let stringsHTMLArr = [];
		let noteTrackHTMLArr = [];
		const colorClass = this.bColorStrings ? "color-string" : "";
		for (let x = 0; x < app.audioProcessor.instrumentMidiOffsets.length; x++) {
			const stringNumberX = x + 1;
			const stringOffsetX = app.audioProcessor.instrumentMidiOffsets[x];

			tuningLetterHTMLArr.push('<span class="tuning-letter" data-string-number="' + stringNumberX + '">' + midiUtils.midiNumberToNoteLetter(stringOffsetX) + '</span>');
			stringsHTMLArr.push('<div class="string-line" data-string-number="' + stringNumberX + '"></div>');
			noteTrackHTMLArr.push('<div class="note-bar ' + colorClass + '" data-midi-offset="' + stringOffsetX + '" data-string-number="' + stringNumberX  + '"></div>');
		}
		if (this.bOrderStringsThickAtBottom) {
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
		
		for (let i = 0; i < app.audioProcessor.midi.tracks[0].notes.length; i++) {
			const note = app.audioProcessor.midi.tracks[0].notes[i];
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
				console.error("Error! Did not get an optimal offset for midi note on the note bar.");
				return;
			}

			notesHTML[optimalKey] += '<div class="note" data-note-index="' + i + '" style="left: ' + notePosition + 'px; width: ' + noteWidth + 'px;"><span>' + midiUtils.midiNumberToFretNumber(optimalKey, note.midi) + '</span></div>';
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
		this.eNoteBars.forEach((inElemX) => {
			inElemX.style.width = this.widthOfNoteBar + 'px';
		});
		this.eNotesWrap.style.left = '0px';
		
		// Start 'playing' visuals.
		this.refreshInterval = setInterval(() => { this.refresh() }, app.msForfps);
	}
	
	stop() {
		console.log("stopping visualizer.");
		clearInterval(this.refreshInterval);
	}

	refresh() {
		if (!app.audioProcessor.audio) {
			console.error("audioProcessor.audio is invalid.");
			return;
		}
		// console.log("refreshing visualizer.");
		// Move the absolute position of all notes from start to end, based on current play time of the audio.
		const currentAudioTime = app.audioProcessor.audio.currentTime;
		const noteBarPosition = currentAudioTime * this.pxPerSecond;
		// TODO this is choppy movement?
		// this.eNotesWrap.style.left = -noteBarPosition + 'px';
		this.eNoteBars.forEach((inElemX) => {
			inElemX.style.transform = 'translatex(' + -noteBarPosition + 'px)';
		});
	}

    create(inParentID, bInOrderStringsThickAtBottom, bInColorStrings) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
		this.eNoteBars = [];
		this.eTuningWrap = this.element.querySelector('.tuning-wrap');
		this.eStringsWrap = this.element.querySelector('.strings-wrap');
		this.eNotesWrap = this.element.querySelector('.notes-wrap');
        /* State */
		this.widthMultiplier = 100;
		this.widthOfNoteBar = 0;
		this.pxPerTick = 0;
		this.pxPerSecond = 0;
		this.endOfTrackTicks = 0;
		this.endOfTrackSeconds = 0;
		this.bOrderStringsThickAtBottom = bInOrderStringsThickAtBottom;
		this.bColorStrings = bInColorStrings;

        window.addEventListener(
			"audio-processor-restarts-audio",
			(e) => {
				e.preventDefault();
				this.restart();
			},
			false
		);

		window.addEventListener(
			"audio-processor-stops-audio",
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

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`

 
<div class="bass-guitar-visualizer main-wrap fieldstyle">
    <div class="tuning-wrap"></div>

    <div class="note-visualizer">
        <div class="strings-wrap"></div>
        <div class="notes-wrap"></div>
    </div>
</div>

        `);
    }
}