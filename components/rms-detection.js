/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class RMSDetection {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="rms-detection"]'), this.getHTMLTemplate());
		this.eBar = this.element.querySelector('.bar');
		this.eMinRMS = this.element.querySelector('.min-rms');

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
	
    start() {
		this.draw();
	}

    stop() {
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	draw() {
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });

        // RMS to Decibels:
		// const decibels = 20 * Math.log(app.audioProcessor.currentRMS) / Math.log(10);
		// Decibels to RMS:
		// const rms = Math.pow(10, (decibel_level / 20));
		// Example of using RMS visually as a 0 to 100 bar:
		// const width = ( rms * 100 ) + '%' 

		// console.log(decibels);
		// console.log(app.audioProcessor.currentRMS);

		this.eBar.style.width = Math.round(app.audioProcessor.currentRMS * 100) + "%";
		this.eMinRMS.style.transform = "translateX(" + Math.round(app.audioProcessor.minRelevantRMS * 100) + "cqw)";
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="rms-detection">
	<span>Input Volume:&nbsp;</span>
	<span class="bar-wrap">
		<span class="bar"></span>
		<span class="min-rms"></span>
	</span>
</div>


        `);
    }
}