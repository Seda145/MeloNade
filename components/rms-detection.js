/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class RMSDetection {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="rms-detection"]'), this.getHTMLTemplate());
		this.eBar = this.element.querySelector('.bar');
		this.eMinRMS = this.element.querySelector('.min-rms');

		/* Events */

		this.acEventListener = new AbortController();
		window.addEventListener("audioprocessor-connected-mic", this.actOnAudioProcessorConnectedMic.bind(this), { signal: this.acEventListener.signal });
        if (app.audioProcessor.micAudioBuffer != null) {
			this.actOnAudioProcessorConnectedMic();
		}
    }

	prepareRemoval() {
		this.acEventListener.abort();
        this.element.remove();
		console.log("Prepared removal of self");
    }
	
	draw() {
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

		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });
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

	/* Events */

	actOnAudioProcessorConnectedMic(e) {
		this.draw();
	}
}