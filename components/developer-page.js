/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class DeveloperPage {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="developer-page"]'), this.getHTMLTemplate());
        // Elements - DeveloperPage
		this.eWrapConfiguration = this.element.querySelector('[data-wrap="configuration"]');
        this.eInputSubmit = this.eWrapConfiguration.querySelector(".input-submit");
		this.eInputSaveProfiles = this.eWrapConfiguration.querySelector('.input-save-profiles');
        this.eInputListenToMidi = this.eWrapConfiguration.querySelector('.input-listen-to-midi');
        // Elements - DeveloperPage - SelectInstrument
        this.eInputSelectInstrument = this.eWrapConfiguration.querySelector('.input-select-instrument');
        this.eInputSelectInstrument.value = app.userdata.data.activeProfile.config.currentInstrument;
        // Elements - DeveloperPage - ConfigInstruments
        this.eConfigInstrumentPanels = this.eWrapConfiguration.querySelectorAll('.config-instrument-panel');
        // Elements - DeveloperPage - ConfigBassGuitar
        this.eConfigBassGuitar = this.eWrapConfiguration.querySelector('.config-bass-guitar');
        this.eInputSelectBassGuitarTuning = this.eWrapConfiguration.querySelector('.input-select-bass-guitar-tuning');
        this.eInputSelectBassGuitarTuning.value = app.userdata.data.activeProfile.config.instruments["bass-guitar"].tuning;
        this.eInputBassGuitarOrderStringsThickAtBottom = this.eWrapConfiguration.querySelector('.input-bass-guitar-order-strings-thick-at-bottom');
        this.eInputBassGuitarColorStrings = this.eWrapConfiguration.querySelector('.input-bass-guitar-color-strings');

        /* State */

        /* Events */

        this.eInputSaveProfiles.addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                console.log("Saving (downloading) profiles.");

                // I would prefer to implement automatic loading / saving of userdata from the working directory, but it's not yet supported on firefox and experimental.
                // https://stackoverflow.com/questions/42743511/reading-writing-to-a-file-in-javascript
                // https://developer.chrome.com/articles/file-system-access/
                const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(app.userdata.data.profiles, null, 2)], { type: "application/json" }));
                // There is still no supported way to just download this to wherever?
                // downloads.download({ url: blobUrl, saveAs: true, fileName: "melonade-profiles.json" });
                let link = document.createElement("a");
                link.download = "melonade-profiles.json";
                link.href = blobUrl;
                link.click();
                link.remove();
            },
            false
        );
        
        this.eInputSelectInstrument.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                // Update userdata to the new value.
                app.userdata.data.activeProfile.config.currentInstrument = e.currentTarget.value;
                // With a new instrument selected, only config widgets related to that instrument should be shown.
                this.updateConfigInstrumentPanels();
            },
            false
        );

        this.eInputSelectBassGuitarTuning.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                // Update userdata to the new value.
                app.userdata.data.activeProfile.config.instruments["bass-guitar"].tuning = e.currentTarget.value;
            },
            false
        );

        /* Setup */
        this.updateConfigInstrumentPanels();
    }


    updateConfigInstrumentPanels() {
        this.eConfigInstrumentPanels.forEach((inElemX) => {
            UIUtils.updateVisibility(inElemX, false);
        });

        if (app.userdata.data.activeProfile.config.currentInstrument == "bass-guitar") {
            UIUtils.updateVisibility(this.eConfigBassGuitar, true);
        }
    }


    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="developer-page main-wrap">
    <div class="row">
        <div class="col-12">
            <fieldset data-wrap="configuration" class="fieldstyle">
                <legend>Configuration</legend>
                
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

                <div class="config-bass-guitar config-instrument-panel">
                    <label>
                        <span>Select a tuning:</span>
                        <select class="input-select-bass-guitar-tuning" name="input-select-bass-guitar-tuning">
                            <!-- MIDI number notation as actual value -->
                            <!-- https://forum.metasystem.io/forum/metagrid-pro/beta/issues/2981-c-2-c-1-midi-notes-lower-keyboard-range-question -->
                            <!-- https://en.wikipedia.org/wiki/List_of_guitar_tunings -->
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

                    <label>
                        <span>Color strings:</span>
                        <input class="input-bass-guitar-color-strings" type="checkbox"/>
                    </label>
                </div>
                
                <hr>

                <button class="input-submit block" type="button">Play</button> 

                <hr>

                <button class="input-save-profiles block" type="button">Save progress</button> 

            </fieldset>
        </div>
    </div>
</div>

        `);
    }
}