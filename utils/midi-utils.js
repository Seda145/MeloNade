/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/


class MidiUtils {
	static {
		// https://www.ccarh.org/courses/253/handout/gminstruments/
		this.timbres = {};
		this.timbres.piano = "piano";
		this.timbres.chromaticPercussion = "chromatic-percussion";
		this.timbres.organ = "organ";
		this.timbres.guitar = "guitar";
		this.timbres.bass = "bass";
		this.timbres.string = "string";
		this.timbres.ensemble = "ensemble";
		this.timbres.brass = "brass";
		this.timbres.reed = "reed";
		this.timbres.pipe = "pipe";
		this.timbres.synthLead = "synth-lead";
		this.timbres.synthPad = "synth-pad";
		this.timbres.synthEffects = "synth-effects";
		this.timbres.ethnic = "ethnic";
		this.timbres.soundEffects = "sound-effects";

		this.instruments = {};
		this.instruments.bassGuitar = "bass-guitar";
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

    static centsOffFromPitch(inFrequency, inMidiNumber) {
        return Math.floor(1200 * Math.log(inFrequency / MidiUtils.midiNumberToFrequency(inMidiNumber)) / Math.log(2));
    }

	static getImplementedInstrumentForInstrumentCode(inInstrumentCode) {
		// Timbres are not specific (strings could be a violin or cello) and we want to work with specific implemented instruments.
		if (inInstrumentCode >= 32 && inInstrumentCode <= 39)
			return this.instruments.bassGuitar;
		else
			return null;
	}

	static getTimbreForInstrumentCode(inInstrumentCode) {
		// https://www.ccarh.org/courses/253/handout/gminstruments/
		// While this is not always specific to an instrument, we can read the instrument code from a midi (which is a collection of instruments / types) and return that collection.
		if (inInstrumentCode >= 0 && inInstrumentCode <= 7)
			return this.timbres.piano;
		else if (inInstrumentCode >= 8 && inInstrumentCode <= 15)
			return this.timbres.chromaticPercussion;
		else if (inInstrumentCode >= 16 && inInstrumentCode <= 23)
			return this.timbres.organ;
		else if (inInstrumentCode >= 24 && inInstrumentCode <= 31)
			return this.timbres.guitar;
		else if (inInstrumentCode >= 32 && inInstrumentCode <= 39)
			return this.timbres.bass;
		else if (inInstrumentCode >= 40 && inInstrumentCode <= 47)
			return this.timbres.string;
		else if (inInstrumentCode >= 48 && inInstrumentCode <= 55)
			return this.timbres.ensemble;
		else if (inInstrumentCode >= 56 && inInstrumentCode <= 63)
			return this.timbres.brass;
		else if (inInstrumentCode >= 64 && inInstrumentCode <= 71)
			return this.timbres.reed;
		else if (inInstrumentCode >= 72 && inInstrumentCode <= 79)
			return this.timbres.pipe;
		else if (inInstrumentCode >= 80 && inInstrumentCode <= 87)
			return this.timbres.synthLead;
		else if (inInstrumentCode >= 88 && inInstrumentCode <= 95)
			return this.timbres.synthPad;
		else if (inInstrumentCode >= 96 && inInstrumentCode <= 103)
			return this.timbres.synthEffects;
		else if (inInstrumentCode >= 104 && inInstrumentCode <= 111)
			return this.timbres.ethnic;
		else if (inInstrumentCode >= 112 && inInstrumentCode <= 127)
			return this.timbres.soundEffects;
		else
			console.error("this instrument code is not known: " + inInstrumentCode);
			return null;
	}
}

