/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class ScoreCounter {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="score-counter"]'), this.getHTMLTemplate());
        this.eCounterStreak = this.element.querySelector(".streak");
        this.eCounterHit = this.element.querySelector(".hit");
        this.eCounterMissed = this.element.querySelector(".missed");
        this.eCounterHitAccuracy = this.element.querySelector(".hit-accuracy");
		
        /* Events */

		this.acEventListener = new AbortController();
        ["audio-processor-start-song", "audio-processor-hit-note", "audio-processor-missed-note"].forEach((eventX) => {
            window.addEventListener(eventX, this.updateCountElements.bind(this), { signal: this.acEventListener.signal });
        });

        /* Setup */
        this.updateCountElements();
    }

    prepareRemoval() {
        this.acEventListener.abort();
        this.element.remove();
        console.log("Prepared removal of self");
    }

    updateCountElements() {
        this.eCounterStreak.textContent = app.audioProcessor.countHitStreak;
        this.eCounterHit.textContent = app.audioProcessor.countHitNotes;
        this.eCounterMissed.textContent = app.audioProcessor.countMissedNotes;
        this.eCounterHitAccuracy.textContent = app.audioProcessor.countHitAccuracy;
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="score-counter">
    <span class="counter-wrap">
        <span>Streak:</span>
        <span class="counter streak"></span>
    </span>
    <span class="counter-wrap">
        <span>Hit:</span>
        <span class="counter hit"></span>
    </span>
    <span class="counter-wrap">
        <span>Missed:</span>
        <span class="counter missed"></span>
    </span>
    <span class="counter-wrap">
        <span>Accuracy:</span>
        <span class="counter hit-accuracy"></span>
        <span>%</span>
    </span>
</div>


        `);
    }
}