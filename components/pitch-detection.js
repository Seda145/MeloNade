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

        const pitch = app.audioProcessor.autocorrolatedPitch;
        const midiNumber = midiUtils.frequencyToNearestMidiNumber(pitch);
        const noteLetter = midiUtils.midiNumberToNoteLetter(midiNumber);
        if (typeof noteLetter === 'undefined') {
            // console.error("noteLetter undefined. (rms too low?)");
            this.eInputPitchDetectionTargetLetter.innerHTML = "-";
        }
        else {
            this.eInputPitchDetectionTargetLetter.innerHTML = noteLetter;
        }
    }

	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="pitch-detection"]'), this.getHTMLTemplate());
        this.eInputPitchDetectionTargetLetter = this.element.querySelector('.target-letter');

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
 
<div class="main-wrap pitch-detection fieldstyle">
    <div class="bar"></div>
    <div class="target">
        <span class="target-letter">-</span>
    </div>
    <div class="bar"></div>

    <div span="current-pos"></div>
</div>


        `);
    }
}