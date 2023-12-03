/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class Oscilloscope {
	start() {
		this.draw();
	}

    stop() {
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
	}

	draw() {
		// Draw an oscilloscope of the current audio source.

		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });

		this.eCanvasCtx.fillStyle = "rgb(0, 0, 0)";
		this.eCanvasCtx.fillRect(0, 0, this.eCanvas.width, this.eCanvas.height);

		this.eCanvasCtx.lineWidth = 2;
		// this.eCanvasCtx.strokeStyle = "rgb(0, 119, 230)";
		this.eCanvasCtx.strokeStyle = "#666";

		this.eCanvasCtx.beginPath();

		{
			const sliceWidth = (this.eCanvas.width * 1.0) / app.audioProcessor.bufferLength;
			let x = 0;
			for (let i = 0; i < app.audioProcessor.bufferLength; i++) {
				// const v = app.audioProcessor.audioBuffer[i] * 200.0;
				const v = app.audioProcessor.audioBuffer[i] * 200.0;
				// const y = (v * this.eCanvas.height) / 2;
				const y = this.eCanvas.height / 2 + v;

				if (i === 0) {
					this.eCanvasCtx.moveTo(x, y);
				} 
				else {
					this.eCanvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}
		}

		this.eCanvasCtx.lineTo(this.eCanvas.width, this.eCanvas.height / 2);
		this.eCanvasCtx.stroke();
	}

	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="oscilloscope"]'), this.getHTMLTemplate());
		this.eCanvas = this.element.querySelector(".oscilloscope-canvas");
		this.eCanvasCtx = this.eCanvas.getContext("2d");

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
 
<div class="main-wrap oscilloscope fieldstyle">
    <!-- Canvas resolution needs to be specified like width and height here. -->
    <canvas class="oscilloscope-canvas"  width="1920px" height="150px"></canvas>
</div>


        `);
    }
}