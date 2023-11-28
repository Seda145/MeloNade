/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class ScoreCounter {
    create(inParentID) {
        /* Elements */
        this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
        this.eCounterStreak = this.element.querySelector(".streak");
        this.eCounterHit = this.element.querySelector(".hit");
        this.eCounterMissed = this.element.querySelector(".missed");
        this.eCounterTotalPercentage = this.element.querySelector(".hit-percentage");
        /* State */
        this.scoreTracker = {}
        /* Events */
        
        window.addEventListener(
			"audio-processor-hit-note",
			(e) => {
				e.preventDefault();

                this.registerHit(e.noteIndex);
			},
			false
		);

        window.addEventListener(
			"audio-processor-missed-note",
			(e) => {
				e.preventDefault();

                this.registerMiss(e.noteIndex);
			},
			false
		);

        /* Setup */
        this.resetScore();
    }

    updateCountElements() {
        let countMissed = 0;
        let countHit = 0;
        for (const [key, value] of Object.entries(this.scoreTracker.notes)) {
            if (value === true) {
                countHit++;
            }
            else {
                countMissed++;
            }
        }
        const total = countMissed + countHit;
        let totalPercentage = total != 0 ? (countHit / (countMissed + countHit) * 100) : 0;
        // Remove decimals.
        totalPercentage = totalPercentage.toFixed(0);

        this.eCounterStreak.innerHTML = this.scoreTracker.streak;
        this.eCounterHit.innerHTML = countHit;
        this.eCounterMissed.innerHTML = countMissed;
        this.eCounterTotalPercentage.innerHTML = totalPercentage;
    }

    resetScore() {
        this.scoreTracker = {}
        this.scoreTracker.notes = {};
        this.scoreTracker.streak = 0;

        this.updateCountElements();
    }

    registerHit(inIndex) {
        if (this.scoreTracker.notes[inIndex] === true) {
            console.error("Already hit, ignoring.");
            return;
        }
        // console.log("hit response.");
        this.scoreTracker.notes[inIndex] = true;
        this.scoreTracker.streak++;
        this.updateCountElements();
    }

    registerMiss(inIndex) {
        if (this.scoreTracker.notes[inIndex] === false) {
            console.error("Already missed, ignoring.");
            return;
        }
        // console.log("miss response.");
        this.scoreTracker.notes[inIndex] = false;
        this.scoreTracker.streak = 0;
        this.updateCountElements();
    }
    
    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="main-wrap score-counter fieldstyle">
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
        <span class="counter hit-percentage"></span>
        <span>%</span>
    </span>
</div>


        `);
    }
}