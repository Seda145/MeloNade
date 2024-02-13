/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class EffectPedalGain {
    create(inScopeElement, inPedalName, inThemeClass) {
		/* Elements */
        this.pedalName = inPedalName;
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="effect-pedal-gain"]'), this.getHTMLTemplate());
        this.element.classList.add(inThemeClass);
        this.ePedalName = this.element.querySelector('.pedal-name');
        this.ePedalName.textContent = this.pedalName;
        this.ePowerSwitch = this.element.querySelector('.power-switch');

        this.bIsEffectActive = false;

        this.gainKnob = new EffectPedalKnob();
        this.gainKnob.create(this.element, "Gain", 1.5, 0, 3);
        
        /* Events */

        this.gainKnob.element.addEventListener(
            "effect-pedal-knob-set-value",
            (e) => {
                e.preventDefault();
                if (!this.bIsEffectActive) {
                    return;
                }
                app.audioProcessor.micGainNode.gain.value = this.gainKnob.knobValue;
                // console.log("Gain set to: " + app.audioProcessor.micGainNode.gain.value);
            },
            false
        );

        this.ePowerSwitch.addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                if (this.bIsEffectActive) {
                    this.disableEffect();
                }
                else {
                    this.enableEffect();
                }
            },
            false
        );

        /* Setup */

        // Disable by default (we don't load preferences yet). Pass on initial state to widgets by calling method. 
        this.disableEffect();
    }

    prepareRemoval() {
        this.element.remove();
        this.gainKnob.prepareRemoval();
        this.gainKnob = null;
        console.log("Prepared removal of self");
    }

    enableEffect() {
        if (!app.audioProcessor || !app.audioProcessor.micGainNode) {
            alert("The microphone has not been set up.");
            return;
        }
        // We use the gain node present on the audioProcessor, which is chained to the analyzer node.
        app.audioProcessor.micGainNode.gain.value = this.gainKnob.knobValue;

        this.bIsEffectActive = true;
        this.element.classList.add('active');
    }

    disableEffect() {
        if (!this.bIsEffectActive) {
            return;
        }
        this.bIsEffectActive = false;
        this.element.classList.remove('active');

        app.audioProcessor.micGainNode.gain.value = 1;
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
 <div class="effect-pedal">
    <div class="pedal-inner">
        <div class="info-panel">
            <span class="pedal-name">${this.pedalName}</span>
        </div>
        <div class="knob-panel">
            <div data-component="effect-pedal-knob"></div>
        </div>
        <div class="power-panel">
            <div class="power-light"></div>
            <div class="power-switch"></div>
        </div>
    </div>
</div>

        `);
    }
}