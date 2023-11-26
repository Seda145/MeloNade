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
        const midiNumber = UIUtils.frequencyToNearestMidiNumber(pitch);
        const noteLetter = UIUtils.midiNumberToNoteLetter(midiNumber);
        if (typeof noteLetter === 'undefined') {
            // console.error("noteLetter undefined. (rms too low?)");
            this.eInputPitchDetectionTargetLetter.innerHTML = "-";
        }
        else {
            this.eInputPitchDetectionTargetLetter.innerHTML = noteLetter;
        }
    }

    create(inParentID) {
        /* Elements */
        this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
        this.eInputPitchDetectionTargetLetter = this.element.querySelector('.target-letter');

        window.addEventListener(
			"audio-processor-restarts-audio",
			(e) => {
				e.preventDefault();
				this.start();
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