/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class DeveloperPage {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="developer-page"]'), this.getHTMLTemplate());
        // Elements - DeveloperPage
        this.eDeveloperPageForm = this.element.querySelector(".developer-page-form");
		this.eInputUserdataFolder = this.element.querySelector('.input-userdata-folder');
        this.eInputListenToMidi = this.element.querySelector('.input-listen-to-midi');
        // Elements - DeveloperPage - SelectInstrument
        this.eInputSelectInstrument = this.element.querySelector('.input-select-instrument');
        // Elements - DeveloperPage - ConfigInstruments
        this.eConfigInstrumentPanels = this.eDeveloperPageForm.querySelectorAll('.config-instrument-panel');
        // Elements - DeveloperPage - ConfigBassGuitar
        this.eInputConfigBassGuitar = this.element.querySelector('.config-bass-guitar');
        this.eInputSelectBassGuitarTuning = this.element.querySelector('.input-select-bass-guitar-tuning');
        this.eInputBassGuitarOrderStringsThickAtBottom = this.element.querySelector('.input-bass-guitar-order-strings-thick-at-bottom');
        this.eInputBassGuitarColorStrings = this.element.querySelector('.input-bass-guitar-color-strings');
        /* State */

        /* Events */

        this.eInputUserdataFolder.addEventListener(
            "change",
            (e) => {
                e.preventDefault();

                app.userdata.setUserdataFromFileList(e.target.files);

                // Silly, but we need to reset this value manually or we can run into old data next time.
                // e.target.value = "";

                if (!app.userdata.isValid()) {
                    console.error("Invalid userdata was uploaded.");
                    return;
                }
                
                console.log("got valid userdata:");
                console.log(app.userdata);
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
                        <span>Upload MeloNade userdata folder</span>
                        <input class="input-userdata-folder" type="file" webkitdirectory="true"/>
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

                    <input class="block" type="submit" value="Submit">
                </fieldset>
            </div>
        </div>
    </form>
</div>

        `);
    }
}