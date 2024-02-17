/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class TonePage {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="tone-page"]'), this.getHTMLTemplate());
        this.GainEffectPedalGain = new EffectPedalGain();
        this.GainEffectPedalGain.create(this.element, "Signal Booster", "white");

        this.audioInputVisualizer = new AudioInputVisualizer();
		this.audioInputVisualizer.create(this.element);
    }

    prepareRemoval() {
        this.GainEffectPedalGain.prepareRemoval();
        this.GainEffectPedalGain = null;
        this.audioInputVisualizer.prepareRemoval();
        this.audioInputVisualizer = null;
        this.element.remove();
        console.log("Prepared removal of self");
    }

    getHTMLTemplate() {
        // TODO autoformat this how? the html tag function is used by lit-html to highlight html. With it active there is no autoformat of the string itself.
        // const html = (inString) => { return inString };
        // return (html`
        return (`
 
<div class="tone-page page container">
    <div class="effect-pedals-wrap">
        <div data-component="effect-pedal-gain"></div>
    </div>

    <div data-component="audio-input-visualizer"></div>
</div>

        `);
    }
}