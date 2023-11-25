class RMSDetection {
    start() {
		this.draw();
	}

    stop() {
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	draw() {
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });

        this.eRMSDetectionNumber.innerHTML = Math.round(app.audioProcessor.currentRMS * 100);

        // RMS to Decibels:
		// const decibels = 20 * Math.log(app.audioProcessor.currentRMS) / Math.log(10);
		// Decibels to RMS:
		// const rms = Math.pow(10, (decibel_level / 20));
		// Example of using RMS visually as a 0 to 100 bar:
		// const width = ( rms * 100 ) + '%' 

		// console.log(decibels);
		// console.log(app.audioProcessor.currentRMS);
    }

    create(inParentID) {
        /* Elements */
        this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
		this.eRMSDetectionNumber = this.element.querySelector('.rms-detection-number');

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
 
<div class="main-wrap oscilloscope fieldstyle">
    <div class="rms-detection">
        <span>Volume:&nbsp;</span>
        <span class="rms-detection-number">-</span>
    </div>
</div>


        `);
    }
}