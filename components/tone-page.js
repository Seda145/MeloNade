/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class TonePage {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="tone-page"]'), this.getHTMLTemplate());


        // Working with gains:
        // this.gainNode = this.audioContext.createGain()
        // this.gainNode.gain.value = parseFloat(0 to 1);
        // this.source = this.audioContext.createMediaStreamSource(stream);
        // this.source.connect(this.gainNode);
        // console.log("Set audio volume to: " + this.gainNode.gain.value);
    }

    prepareRemoval() {
        this.element.remove();
        console.log("Prepared removal of self");
    }

    getHTMLTemplate() {
        // TODO autoformat this how? the html tag function is used by lit-html to highlight html. With it active there is no autoformat of the string itself.
        // const html = (inString) => { return inString };
        // return (html`
        return (`
 
<div class="tone-page page container">
    <div class="row">
        <div class="col-12">
           
            <div class="pedals-wrap">
                <div class="pedal-column">
                    <div class="pedal-column">
                        <div class="pedal">
                            <div class="info-panel">

                            </div>
                            <div class="knob-panel">

                            </div>
                            <div class="power-panel">
                                <div class="power-switch">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

        `);
    }
}