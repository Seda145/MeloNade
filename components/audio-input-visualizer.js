/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class AudioInputVisualizer {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="audio-input-visualizer"]'), this.getHTMLTemplate());
	
        this.oscilloscope = new Oscilloscope();
        this.oscilloscope.create(this.element);

        this.pitchDetection = new PitchDetection();
        this.pitchDetection.create(this.element);

        this.rmsDetection = new RMSDetection();
        this.rmsDetection.create(this.element);
    }

	prepareRemoval() {
        this.oscilloscope.prepareRemoval();
        this.oscilloscope = null;
        this.pitchDetection.prepareRemoval();
        this.pitchDetection = null;
        this.rmsDetection.prepareRemoval();
        this.rmsDetection = null;
        this.element.remove();
		console.log("Prepared removal of self");
    }
	
    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="audio-input-visualizer">
    <div data-component="oscilloscope"></div>
    <div data-component="rms-detection"></div>
    <div data-component="pitch-detection"></div>
</div>


        `);
    }

}