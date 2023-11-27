class DeveloperPage {
    create(inParentID) {
        /* Elements */
		this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
        // Elements - DeveloperPage
        this.eDeveloperPageForm = this.element.querySelector(".developer-page-form");
        this.eInputDeveloperPageAudio = this.element.querySelector('.input-developer-page-audio');
        this.eInputDeveloperPageMidi = this.element.querySelector('.input-developer-page-midi');
        this.eInputListenToMidi = this.element.querySelector('.input-listen-to-midi');
        this.eInputDeveloperPageStopAudio = this.element.querySelector('.input-developer-page-stop-audio');
        // Elements - DeveloperPage - SelectInstrument
        this.eInputSelectInstrument = this.element.querySelector('.input-select-instrument');
        // Elements - DeveloperPage - ConfigInstruments
        this.eConfigInstrumentPanels = this.eDeveloperPageForm.querySelectorAll('.config-instrument-panel');
        // Elements - DeveloperPage - ConfigBassGuitar
        this.eInputConfigBassGuitar = this.element.querySelector('.config-bass-guitar');
        this.eInputSelectBassGuitarTuning = this.element.querySelector('.input-select-bass-guitar-tuning');
        this.eInputBassGuitarOrderStringsThickAtBottom = this.element.querySelector('.input-bass-guitar-order-strings-thick-at-bottom');
        /* State */

        /* Events */

        this.eInputDeveloperPageStopAudio.addEventListener(
            "click",
            (e) => {
                app.audioProcessor.stopAudio();
            },
            false
        );

        this.eInputSelectInstrument.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                this.updateConfigInstrumentPanels();
            },
            false
        );
        
        this.updateConfigInstrumentPanels();
    }


    updateConfigInstrumentPanels() {
        const choice = this.eInputSelectInstrument.value;
        // console.log("eInputSelectInstrument value: " + choice);

        this.eConfigInstrumentPanels.forEach((inElemX) => {
            UIUtils.updateVisibility(inElemX, false);
        });

        if (choice == "bass-guitar") {
            UIUtils.updateVisibility(this.eInputConfigBassGuitar, true);
        }
    }


    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="developer-page main-wrap">
    <form class="developer-page-form">
        <div class="row">
            <div class="col-12">
                <fieldset class="fieldstyle">
                    <legend>Configuration</legend>

                    <label>
                        <span>Audio input</span>
                        <input class="input-developer-page-audio" type="file" accept="audio/*"/>
                    </label>

                    <label>
                        <span>Midi input</span>
                        <input class="input-developer-page-midi" type="file" accept="audio/midi"/>
                    </label>

                    <label>
                        <span>ListenToMidi:</span>
                        <input class="input-listen-to-midi" type="checkbox"/>
                    </label>

                    <hr>

                    <label>
                        <span>Select an instrument:</span>
                        <select class="input-select-instrument" name="input-select-instrument">
                            <option value="bass-guitar">Bass guitar</option>
                        </select> 
                    </label>

                    <div class="config-bass-guitar" class="config-instrument-panel hide">
                        <label>
                            <span>Select a tuning:</span>
                            <select class="input-select-bass-guitar-tuning" name="input-select-bass-guitar-tuning">
                                <!-- MIDI number notation as actual value -->
                                <option value="28,33,38,43">E A D G (Standard E)</option>

                                <option value="26,33,38,43">D A D G (Drop D)</option>
                                <option value="25,32,37,42">C♯ G♯ C♯ F♯ (Drop C♯)</option>
                                <option value="24,31,36,41">C G C F (Drop C)</option>
                                <option value="23,30,35,40">B F♯ B E (Drop B)</option>
                                <option value="22,29,34,39">A♯ F A♯ D♯ (Drop A♯)</option>
                                <option value="21,28,33,38">A E A D (Drop A)</option>

                                <option value="26,31,38,43">D G D G (Open G)</option>
                                <option value="29,33,36,41">F A C F (Open F)</option>
                                <option value="28,35,40,44">E B E G♯ (Open E)</option>
                                <option value="26,33,38,42">D A D F♯ (Open D)</option>
                                <option value="24,31,36,43">C G C G (Open C)</option>
                                <option value="23,30,35,42">B F♯ B F♯ (Open B)</option>
                                <option value="21,28,33,40">A E A E (Open A)</option>
                            </select>
                        </label>

                        <label>
                            <span>Order the strings by thickest at the bottom:</span>
                            <input class="input-bass-guitar-order-strings-thick-at-bottom" type="checkbox" checked/>
                        </label>
                    </div>
                    
                    <hr>

                    <input class="block" type="submit" value="Play">
                    <br>
                    <button class="input-developer-page-stop-audio" class="block" type="button">Stop</button>
                </fieldset>
            </div>
        </div>
    </form>
</div>


        `);
    }
}