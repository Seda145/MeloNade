/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class Oscilloscope {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="oscilloscope"]'), this.getHTMLTemplate());
		this.eCanvas = this.element.querySelector(".oscilloscope-canvas");
		this.canvasCtx = this.eCanvas.getContext("2d");

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
		// I've been thinking about changing the rms detection widget from a bar to a simple background light behind the oscillator. Mind food for later.
		// Simplifying the UI reduces the need for explanations as literal text like "input volume" if it feels right.
		// Would need to use clearRect so that the background can be set to transparent without drawing on top of previous frames.
		// this.canvasCtx.clearRect(0, 0, this.eCanvas.width, this.eCanvas.height);
		// this.canvasCtx.fillStyle = "rgb(0, 0, 0)";
		this.canvasCtx.fillStyle = "#735757";
		// this.canvasCtx.fillStyle = "rgba(0, 0, 0, 0)";
		this.canvasCtx.fillRect(0, 0, this.eCanvas.width, this.eCanvas.height);

		this.canvasCtx.lineWidth = 3;
		this.canvasCtx.strokeStyle = "#00b558";

		this.canvasCtx.beginPath();

		{
			const sliceWidth = (this.eCanvas.width * 1.0) / app.audioProcessor.bufferLength;
			let x = 0;
			for (let i = 0; i < app.audioProcessor.bufferLength; i++) {
				// const v = app.audioProcessor.micAudioBuffer[i] * 200.0;
				const v = app.audioProcessor.micAudioBuffer[i] * 200.0;
				// const y = (v * this.eCanvas.height) / 2;
				const y = this.eCanvas.height / 2 + v;

				if (i === 0) {
					this.canvasCtx.moveTo(x, y);
				} 
				else {
					this.canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}
		}

		this.canvasCtx.lineTo(this.eCanvas.width, this.eCanvas.height / 2);
		this.canvasCtx.stroke();
		
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });
	}

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="oscilloscope">
    <!-- Canvas resolution needs to be specified like width and height here. -->
    <canvas class="oscilloscope-canvas"  width="1920px" height="150px"></canvas>
</div>


        `);
    }

	/* Events */

	actOnAudioProcessorConnectedMic(e) {
		this.draw();
	}
}