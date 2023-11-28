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

	static async formatMidiFile(inMidiFile) {
		if (!inMidiFile) {
			console.error("Invalid midi file.");
		}
	    const midiUrl = URL.createObjectURL(inMidiFile);
		// The original midi object formatted from the midi file.
        const original = await Midi.fromUrl(midiUrl);
        console.log(original);

		// Format so that we can use tick time of the midi as a key for looking up notes.
		let result = original;
		// for (let i = 0; i < result.tracks.length; i++) {
		// 	let newNotes = {};

		// 	for (let k = 0; k < result.tracks[i].notes.length; k++) {
				
		// 	}

		// 	result.tracks[i].notes = newNotes;
		// }

		return result;
	}
    
}

