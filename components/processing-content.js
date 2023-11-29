/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class ProcessingContent {
    create(inScopeElement, bInOrderStringsThickAtBottom, bInColorStrings) {
        /* Elements */
        this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="processing-content"]'), this.getHTMLTemplate());

        this.oscilloscope = new Oscilloscope();
        this.oscilloscope.create(this.element);

        this.pitchDetection = new PitchDetection();
        this.pitchDetection.create(this.element);

        this.rmsDetection = new RMSDetection();
        this.rmsDetection.create(this.element);

        this.scoreCounter = new ScoreCounter();
        this.scoreCounter.create(this.element);

        this.bassGuitarVisualizer = new BassGuitarVisualizer();
        this.bassGuitarVisualizer.create(this.element, bInOrderStringsThickAtBottom, bInColorStrings);
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="processing-content main-wrap">
    <div data-component="oscilloscope"></div>
    <div data-component="pitch-detection"></div>
    <div data-component="rms-detection"></div>
    <div data-component="score-counter"></div>
    <div data-component="bass-guitar-visualizer"></div>
</div>

        `);
    }
}