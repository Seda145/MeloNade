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

	static getTimbreForInstrumentCode(inInstrumentCode) {
		// https://www.ccarh.org/courses/253/handout/gminstruments/
		// While this is not always specific to an instrument, we can read the instrument code from a midi (which is a collection of instruments / types) and return that collection.
		switch(inInstrumentCode) {
			case (inInstrumentCode >= 0 && inInstrumentCode <= 7):
				return this.timbres.piano;
			case (inInstrumentCode >= 8 && inInstrumentCode <= 15):
				return this.timbres.chromaticPercussion;
			case (inInstrumentCode >= 16 && inInstrumentCode <= 23):
				return this.timbres.organ;
			case (inInstrumentCode >= 24 && inInstrumentCode <= 31):
				return this.timbres.guitar;
			case (inInstrumentCode >= 32 && inInstrumentCode <= 39):
				return this.timbres.bass;
			case (inInstrumentCode >= 40 && inInstrumentCode <= 47):
				return this.timbres.string;
			case (inInstrumentCode >= 48 && inInstrumentCode <= 55):
				return this.timbres.ensemble;
			case (inInstrumentCode >= 56 && inInstrumentCode <= 63):
				return this.timbres.brass;
			case (inInstrumentCode >= 64 && inInstrumentCode <= 71):
				return this.timbres.reed;
			case (inInstrumentCode >= 72 && inInstrumentCode <= 79):
				return this.timbres.pipe;
			case (inInstrumentCode >= 80 && inInstrumentCode <= 87):
				return this.timbres.synthLead;
			case (inInstrumentCode >= 88 && inInstrumentCode <= 95):
				return this.timbres.synthPad;
			case (inInstrumentCode >= 96 && inInstrumentCode <= 103):
				return this.timbres.synthEffects;
			case (inInstrumentCode >= 104 && inInstrumentCode <= 111):
				return this.timbres.ethnic;
			case (inInstrumentCode >= 112 && inInstrumentCode <= 127):
				return this.timbres.soundEffects;
			default:
				console.error("this instrument code is not known: " + inInstrumentCode);
		}
	}
}

