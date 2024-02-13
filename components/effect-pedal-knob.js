/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class EffectPedalKnob {
    create(inScopeElement, inName, inValue, inMinValue, inMaxValue) {
		/* Elements */
        this.knobName = inName;
        this.bIsDraggingKnob = false;
        this.knobValue = inValue;
        this.knobMinValue = inMinValue;
        this.knobMaxValue = inMaxValue;

		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="effect-pedal-knob"]'), this.getHTMLTemplate());
        this.eKnobName = this.element.querySelector('.knob-name');
        this.eKnobName.textContent = this.knobName;
        this.eKnob = this.element.querySelector('.knob');
        this.eValueIndicator = this.element.querySelector('.value-indicator');

        /* Events */

        this.eKnob.addEventListener(
            "mousedown",
            (e) => {
                e.preventDefault();
                this.bIsDraggingKnob = true;
                // console.log("Started dragging");
            },
            false
        );

        this.acEventListener = new AbortController();
        // Would rather not bind this to window, but if bound to the knob events only fire while hovering over the knob.
		window.addEventListener("mouseup", this.actOnMouseUp.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("mousemove", this.actOnMouseMove.bind(this), { signal: this.acEventListener.signal });

        // Update the widgets to the default state.
        this.setKnobValue(this.knobValue);
    }

    prepareRemoval() {
        this.acEventListener.abort();
        this.element.remove();
        console.log("Prepared removal of self");
    }

    // Set the value. This will be clamped between min and max.
    setKnobValue(inValue) {
        this.knobValue = MathUtils.clamp(inValue, this.knobMinValue, this.knobMaxValue);
        const setValueEvent = new Event('effect-pedal-knob-set-value', { bubbles: false });

        // Update the widget.
        // The knob rotation uses -150 to 150 deg (-0% to 100% value).
        const degAlpha = MathUtils.normalizeToAlpha(this.knobValue, this.knobMinValue, this.knobMaxValue);
        const rotateDeg = MathUtils.lerp(-150, 150, degAlpha);
        this.eValueIndicator.style.transform = 'rotateZ(' + rotateDeg + 'deg)';

        // console.log("Effect pedal set value to: " + this.knobValue);
        this.element.dispatchEvent(setValueEvent);
    }

    // Set the minimal value and adjust current value, max value, to fit.
    setMinKnobValue(inValue) {
        this.knobMinValue = inValue;
        if (this.knobValue < this.knobMinValue) {
            this.setKnobValue(this.knobMinValue);
        }
        if (this.knobMaxValue < this.knobMinValue) {
            this.setMaxKnobValue(this.knobMinValue);
        }
        console.log("Effect pedal set min value to: " + this.knobMinValue);
    }

    // Set the maxmimal value and adjust current value, min value, to fit.
    setMaxKnobValue(inValue) {
        this.knobMaxValue = inValue;
        if (this.knobValue > this.knobMaxValue) {
            this.setKnobValue(this.knobMaxValue);
        }
        if (this.knobMinValue > this.knobMaxValue) {
            this.setMinKnobValue(this.knobMaxValue);
        }
        console.log("Effect pedal set max value to: " + this.knobMaxValue);
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        // return (html`
        return (`
 
<div class="effect-pedal-knob">
    <div class="knob-wrap">
        <div class="knob-info">
            <span class="knob-name">${this.knobName}</span>
        </div>
        <div class="knob">
            <div class="bottom">

            </div>
            <div class="middle">

            </div>
            <div class="top">
                <div class="value-indicator"></div>
            </div>
        </div>
    </div>
</div>

        `);
    }

    /* Events */

    actOnMouseUp(e) {
        this.bIsDraggingKnob = false;
        // console.log("Stopped dragging");
    }

    actOnMouseMove(e) {
        if (!this.bIsDraggingKnob) {
            return;
        }
        // console.log("dragging");
        // console.log(e);

        // Get the center of the knob on its position (css dependent).
        const knobSizeOffset = { x: this.eKnob.getBoundingClientRect().width / 2, y: this.eKnob.getBoundingClientRect().height / 2 };
        const knobPos = { x: this.eKnob.getBoundingClientRect().left + knobSizeOffset.x, y: this.eKnob.getBoundingClientRect().top + knobSizeOffset.y}; 
        // Get the cursor position.
        const cursPos = { x: e.clientX, y: e.clientY};
        // The vector from the knob center to the cursor position.
        let targetVector = { x: cursPos.x - knobPos.x, y: cursPos.y - knobPos.y };

        // down 0 / -0, left -0.5, top 1 / -1, right 0.5.
        let z = Math.atan2(targetVector.x, targetVector.y) / Math.PI;
        const bIsRightSide = z > 0;
        // So we count 0 to one instead of 1 to 0 clockwise. Note we are still counting starting from halfway.
        z = bIsRightSide ? Math.abs(1 - z) : Math.abs(z);

        const valueRange = this.knobMaxValue - this.knobMinValue;
        // We can use this info to prevent flopping from min to max or max to min.
        if ((bIsRightSide && this.knobValue / valueRange < 0.1)
            || (!bIsRightSide && this.knobValue / valueRange > 0.9)
        ) {
            // Deny flopping below 10% value.
            // console.log("prevented flopping to other end of value range.");
            return;
        }

        // from 0 to half or half to max. Should be getting a 0 to 1 range now.
        let alpha = bIsRightSide ? z / 2 + 0.5 : z / 2;
        // console.log(alpha);

        this.setKnobValue(valueRange * alpha);
    }
}