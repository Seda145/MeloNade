/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class midiUtils {
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

    static centsOffFromPitch(inFrequency, inMidiNumber) {
        return Math.floor(1200 * Math.log(inFrequency / midiUtils.midiNumberToFrequency(inMidiNumber)) / Math.log(2));
    }
}

