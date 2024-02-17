/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class ProcessingContent {
    create(inScopeElement) {
        /* Elements */
        this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="processing-content"]'), this.getHTMLTemplate());

        this.songControl = new SongControl();
        this.songControl.create(this.element);

        this.audioInputVisualizer = new AudioInputVisualizer();
		this.audioInputVisualizer.create(this.element);

        this.scoreCounter = new ScoreCounter();
        this.scoreCounter.create(this.element);

        switch(app.userdata.data.activeProfile.config.instruments["bass-guitar"].visualizer) {
            case ("vertical"):
                this.bassGuitarVisualizerVertical = new BassGuitarVisualizerVertical();
                this.bassGuitarVisualizerVertical.create(this.element);
            break;
            case ("horizontal"):
                this.bassGuitarVisualizer = new BassGuitarVisualizer();
                this.bassGuitarVisualizer.create(this.element);
            break;
            default:
                console.error("This visualizer has not been implemented.");
        }
    }

    prepareRemoval() {
        this.songControl.prepareRemoval();
        this.songControl = null;

        this.audioInputVisualizer.prepareRemoval();
        this.audioInputVisualizer = null;

        this.scoreCounter.prepareRemoval();
        this.scoreCounter = null;
        if (this.bassGuitarVisualizerVertical) {
            this.bassGuitarVisualizerVertical.prepareRemoval();
            this.bassGuitarVisualizerVertical = null;
        }
        if (this.bassGuitarVisualizer) {
            this.bassGuitarVisualizer.prepareRemoval();
            this.bassGuitarVisualizer = null;
        }
        this.element.remove();
        console.log("Prepared removal of self");
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="processing-content page container">
    <div data-component="score-counter"></div>
    <div data-component="bass-guitar-visualizer"></div>
    <div data-component="bass-guitar-visualizer-vertical"></div>
    <div data-component="audio-input-visualizer"></div>
    <div data-component="song-control"></div>
</div>

        `);
    }
}