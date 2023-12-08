/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class BackgroundLighting {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="background-lighting"]'), this.getHTMLTemplate());

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

		// console.log("Drawing lighting.");
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="background-lighting">

</div>


        `);
    }
}