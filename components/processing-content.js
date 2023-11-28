/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class ProcessingContent {
    create(inParentID, bInOrderStringsThickAtBottom, bInColorStrings) {
        /* Elements */
        this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());

        this.oscilloscope = new Oscilloscope();
        this.oscilloscope.create("oscilloscope-wrap");

        this.pitchDetection = new PitchDetection();
        this.pitchDetection.create("pitch-detection-wrap");

        this.rmsDetection = new RMSDetection();
        this.rmsDetection.create("rms-detection-wrap");

        this.scoreCounter = new ScoreCounter();
        this.scoreCounter.create("score-counter-wrap");

        this.bassGuitarVisualizer = new BassGuitarVisualizer();
        this.bassGuitarVisualizer.create("bass-guitar-visualizer-wrap", bInOrderStringsThickAtBottom, bInColorStrings);
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="processing-content main-wrap">
    <div id="oscilloscope-wrap"></div>
    <div id="pitch-detection-wrap"></div>
    <div id="rms-detection-wrap"></div>
    <div id="score-counter-wrap"></div>
    <div id="bass-guitar-visualizer-wrap"></div>
</div>

        `);
    }
}