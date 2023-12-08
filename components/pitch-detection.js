/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class PitchDetection {
    start() {
		this.draw();
	}

    stop() {
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	draw() {
        this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });

        if (app.audioProcessor.currentRMS < app.audioProcessor.minRelevantRMS) {
            // If the RMS value is too low, we have nothing new to show.
            return;
        }

        // Clear the reset timeout if we do have valid values, then immediately set a new one.
        clearTimeout(this.clearValueTimeoutHandle);
        // Once we stop receiving data, or the volume is too silent to make sense of, we won't get relevant or updated pitch data.
        // Instead of showing the old value we can decide here to show nothing.
        // Doing this immediately is to aggresive and can cause the widget to show nothing / not long enough.
        this.clearValueTimeoutHandle = setTimeout(() => {
            this.eInputPitchDetectionTargetLetter.innerHTML = "-";
            this.eBarNegativeFill.style.width = "0%";
            this.eBarPositiveFill.style.width = "0%";
            this.eInputPitchDetectionTarget.classList.remove("accurate");
            // console.log("Reset pitch widget to 0, because there is no pitch to show.");
        }, 200);

        const pitch = app.audioProcessor.autocorrolatedPitch;
        const midiNumber = MidiUtils.frequencyToNearestMidiNumber(pitch);
        const noteLetter = MidiUtils.midiNumberToNoteLetter(midiNumber);
        if (typeof noteLetter === 'undefined') {
            // console.error("noteLetter undefined. (rms too low?)");
            this.eInputPitchDetectionTargetLetter.innerHTML = "-";
        }
        else {
            this.eInputPitchDetectionTargetLetter.innerHTML = noteLetter;
        }


        const centsOffPitch = app.audioProcessor.currentCentsDifferenceFromNote;
        // clamp to a value of 0 to 100 to use as percentage.
        const absCentsOffPitch = Math.abs(centsOffPitch);
        const absCentsOffPercentage = (absCentsOffPitch < 0 ? 0 : absCentsOffPitch > 100 ? 100 : absCentsOffPitch);
        // console.log(centsOffPitch);

        if (centsOffPitch < 0) {
            this.eBarNegativeFill.style.width = absCentsOffPercentage + "%";
            this.eBarPositiveFill.style.width = "0%";
        }
        else {
            this.eBarNegativeFill.style.width = "0%";
            this.eBarPositiveFill.style.width = absCentsOffPercentage + "%";
        }

        // Todos.
        // For debugging it is useful to visualize the hit tolerance, but to the end user this is not necessarily relevant. 
        // This pitch widget is used as a tuner and should not (while it can be useful) be displaying the fault tolerance of the audio processor.
        // Be aware of css transition time.
        // Similar issue exists with the note letter which rapidly changes, some form of average value should be read / tracked so it's human readable.
        // if (absCentsOffPitch <= app.audioProcessor.hitDetectionCentsTolerance) {
        if (absCentsOffPitch <= 10) {
            this.eInputPitchDetectionTarget.classList.add("accurate");
        }
        else {
            this.eInputPitchDetectionTarget.classList.remove("accurate");
        }
    }

	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="pitch-detection"]'), this.getHTMLTemplate());
        this.eInputPitchDetectionTarget = this.element.querySelector('.target');
        this.eInputPitchDetectionTargetLetter = this.element.querySelector('.target-letter');
        this.eBarNegativeFill = this.element.querySelector('.bar.negative .fill');
        this.eBarPositiveFill = this.element.querySelector('.bar.positive .fill');

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
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="pitch-detection">
    <div class="bar negative">
        <div class="fill"></div>
    </div>
    <div class="target">
        <span class="target-letter">-</span>
    </div>
    <div class="bar positive">
        <div class="fill"></div>
    </div>

    <div span="current-pos"></div>
</div>


        `);
    }
}