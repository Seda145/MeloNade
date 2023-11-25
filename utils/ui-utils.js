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

	static createElement(inHTML) {
		// Helper method to create an element exactly as the html argument specifies, without leaving a wrapping parent container created by "createElement".
		let newElem = document.createElement("div");	
        newElem.innerHTML = inHTML;
        newElem = newElem.firstElementChild;
		return newElem;		
	}

	static setInnerHTML(inParentID, inHTML) {
		// Helper method to create and append an element exactly as the html argument specifies, without leaving a wrapping parent container created by "createElement".
        let parentElem = document.getElementById(inParentID);
		let newElem = UIUtils.createElement(inHTML);
        parentElem.appendChild(newElem);
		return newElem;
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
		const midiNumber = Math.round((12 * Math.log2(inFrequency / 440)) + 69);
		// console.log("nearest midi number to frequency: " + midiNumber);
		return midiNumber;
	}
}

