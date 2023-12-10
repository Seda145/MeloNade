/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class BassGuitarVisualizerVertical {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="bass-guitar-visualizer-vertical"]'), this.getHTMLTemplate());
		this.eHorizontalWrap = this.element.querySelector('.horizontal-wrap');
		this.eVerticalWrap = this.element.querySelector('.vertical-wrap');
		this.eTuningWrap = this.element.querySelector('.tuning-wrap');
		this.eStringsWrap = this.element.querySelector('.strings-wrap');
		this.eNotesWrap = this.element.querySelector('.notes-wrap');
		this.eNoteBar = this.element.querySelector('.note-bar');
        /* State */
		this.movePixelsPerSecond = 300;

    	/* Events */

		this.acEventListener = new AbortController();
		window.addEventListener("audio-processor-start-song", this.actOnAudioProcessorStartSong.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("audio-processor-stop-song", this.actOnAudioProcessorStopSong.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("audio-processor-hit-note", this.actOnAudioProcessorHitNote.bind(this), { signal: this.acEventListener.signal });
	}

	prepareRemoval() {
		this.acEventListener.abort();
        this.element.remove();
		console.log("Prepared removal of self");
    }
	
	draw() {
		if (!app.audioProcessor.audio) {
			console.error("audioProcessor.audio is invalid.");
			return;
		}
		// console.log("refreshing visualizer.");
		// Move the absolute position of all notes from start to end, based on current play time of the audio.
		const currentAudioTime = app.audioProcessor.audio.currentTime;
		const noteBarPosition = currentAudioTime * this.movePixelsPerSecond;
		// TODO this is choppy movement?
		this.eNoteBar.style.transform = 'translatey('+ Math.round(noteBarPosition) + 'px)';

		// Planning to do some form of dynamic "zooming" on the fretboard where we are playing, Instead of showing the full fretboard at all times (making notes miniature). 
		// For now this is used to fit the fretboard to other resolutions.
		const scaleFactor = this.eHorizontalWrap.clientWidth / this.eVerticalWrap.clientWidth;
		this.eHorizontalWrap.style.transform = 'scale(' + scaleFactor + ')';
		// console.log(scaleFactor);

		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });
	}

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="bass-guitar-visualizer-vertical color-string">
    <div class="horizontal-wrap">
		<div class="play-area">
			<div class="vertical-wrap">
				<div class="note-visualizer">
					<div class="notes-wrap">
						<div class="note-bar"></div>
					</div>
				</div>
				
				<div class="strings-section">
					<div class="strings-wrap"></div>
					<div class="strings-inlays">
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
						<span class="string-inlay"></span>
					</div>
				</div>
			</div>        	
		</div>

    	<div class="tuning-wrap"></div>
    </div>
</div>

        `);
    }

    /* Events */

	actOnAudioProcessorStartSong(e) {
		console.log("restarting visualizer.");
		
		const fretboardWidth = 1920;
		this.eTuningWrap.style.width = 'calc(' + fretboardWidth + 'px / 25 - 5px)';
		this.eVerticalWrap.style.width = fretboardWidth + 'px';

		// regenerate all notes on the visualizer.

		// Clear html that will be regenerated.
		this.eTuningWrap.innerHTML = "";
		this.eStringsWrap.innerHTML = "";
		this.eNoteBar.innerHTML = "";

		// Some data from the configuration such as tuning has to be collected and written to elements.
		let tuningLetterHTMLArr = [];
		let stringsHTMLArr = [];
		// let noteTrackHTMLArr = [];
		const stringMidiOffsets = app.userdata.data.activeProfile.config.instruments["bass-guitar"].tuning.split(",");

		for (let x = 0; x < stringMidiOffsets.length; x++) {
			const stringNumberX = x + 1;
			const stringOffsetX = stringMidiOffsets[x];

			tuningLetterHTMLArr.push('<span class="tuning-letter" data-string-number="' + stringNumberX + '">' + MidiUtils.midiNumberToNoteLetter(stringOffsetX) + '</span>');
			stringsHTMLArr.push('<div class="string-line" data-string-number="' + stringNumberX + '"></div>');
		}
		if (app.userdata.data.activeProfile.config.instruments["bass-guitar"].orderStringsThickAtBottom == "true") {
			tuningLetterHTMLArr.reverse();
			stringsHTMLArr.reverse();
		}
		const tuningLetterHTML = tuningLetterHTMLArr.join("");
		const stringsHTML = stringsHTMLArr.join("");

		this.eTuningWrap.insertAdjacentHTML('afterbegin', tuningLetterHTML);
		this.eStringsWrap.insertAdjacentHTML('afterbegin', stringsHTML);

		let verticalNotesHTML = [];
			
		for (let i = 0; i < app.audioProcessor.midi.tracks[app.audioProcessor.midiTrackIndex].notes.length; i++) {
			const note = app.audioProcessor.midi.tracks[app.audioProcessor.midiTrackIndex].notes[i];
			const notePositionSeconds = app.audioProcessor.midi.header.ticksToSeconds(note.ticks);
			const notePosition = notePositionSeconds * this.movePixelsPerSecond;
			const noteDurationSeconds = app.audioProcessor.midi.header.ticksToSeconds(note.durationTicks);
			const minNoteHeight = Math.round(noteDurationSeconds * this.movePixelsPerSecond);

			// Figure out which bar is best to display the note on.
			const midiNumber = note.midi;
			let smallestDistance = 999;
			// The string tuned to be the closest to the desired note.
			let optimalKey = null;
			let optimalStringNumber = null;

			// For every "string" (note bar), where key is the tuning of the string and value the html.
			for (let x = 0; x < stringMidiOffsets.length; x++) {
				const stringMidiOffset = parseInt(stringMidiOffsets[x]);
				if (midiNumber < stringMidiOffset) {
					// We can't play lower than a 0 on the string.
					continue;
				}
				const difference = midiNumber - stringMidiOffset;
				if (difference < smallestDistance) {
					optimalKey = stringMidiOffset;
					optimalStringNumber = x + 1;
					smallestDistance = difference;
				}
			}
			if (optimalKey != null) {
				const fretNumber = MidiUtils.midiNumberToFretNumber(optimalKey, midiNumber);
				// Based on 24 frets, leaving 1 extra for the "0 fret".
				const fretPosition = 100 / 25 * fretNumber;
				verticalNotesHTML.push('<div class="note" data-note-index="' + i + '" data-string-number="' + optimalStringNumber + '" style="bottom: ' + notePosition + 'px; left: ' + fretPosition + '%; min-height: ' + minNoteHeight + 'px;"><span>' + fretNumber + '</span></div>');
			}
			else {
				console.warn("Could not find a position on any string for this note, within the current offsets (instrument tuning). Midi number: " + midiNumber + ", as note letter: " + MidiUtils.midiNumberToNoteLetter(midiNumber) + ", note index: " + i);
			}
		}

		this.eNoteBar.innerHTML = verticalNotesHTML.join("");
		const heightOfVerticalNoteBar = Math.round(app.audioProcessor.audio.duration * this.movePixelsPerSecond);
		this.eNoteBar.style.height = heightOfVerticalNoteBar + "px";

		// Start 'playing' visuals.
		this.draw();
	}

	actOnAudioProcessorStopSong(e) {
		console.log("stopping visualizer.");
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	actOnAudioProcessorHitNote(e) {
		// console.log("response to hit note:");
		// console.log(e.note);

		let eCurrentNote = this.eNotesWrap.querySelector('.note[data-note-index="' + e.noteIndex + '"]');
		if (!eCurrentNote) {
			console.error("no matching note element found for processed note with index: " + e.noteIndex);
			return;
		} 
		eCurrentNote.classList.add("hit");
	}
}