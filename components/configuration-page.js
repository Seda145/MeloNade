/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class ConfigurationPage {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="configuration-page"]'), this.getHTMLTemplate());
        // Elements - ConfigurationPage
		this.eWrapConfiguration = this.element.querySelector('[data-wrap="configuration"]');
		this.eInputSaveProfiles = this.eWrapConfiguration.querySelector('.input-save-profiles');
        this.eInputListenToMidi = this.eWrapConfiguration.querySelector('.input-listen-to-midi');
        this.eInputListenToMidi.checked = app.userdata.data.activeProfile.config.listenToMidi == "true";
        this.eInputListenToInput = this.eWrapConfiguration.querySelector('.input-listen-to-input');
        this.eInputListenToInput.checked = app.userdata.data.activeProfile.config.listenToInput == "true";
        this.eInputAudioVolume = this.eWrapConfiguration.querySelector('.input-audio-volume');
        this.eInputAudioVolume.value = app.userdata.data.activeProfile.config.audioVolume;
        this.eInputEnableLightEffects = this.eWrapConfiguration.querySelector('.input-enable-light-effects');
        this.eInputEnableLightEffects.checked = app.userdata.data.activeProfile.config.enableLightEffects == "true";
        // Elements - ConfigurationPage - SelectInstrument
        this.eInputSelectInstrument = this.eWrapConfiguration.querySelector('.input-select-instrument');
        this.eInputSelectInstrument.value = app.userdata.data.activeProfile.config.currentInstrument;
        // Elements - ConfigurationPage - ConfigInstruments
        this.eConfigInstrumentPanels = this.eWrapConfiguration.querySelectorAll('.config-instrument-panel');
        // Elements - ConfigurationPage - ConfigBassGuitar
        this.eConfigBassGuitar = this.eWrapConfiguration.querySelector('.config-bass-guitar');
        this.eInputSelectBassGuitarTuning = this.eWrapConfiguration.querySelector('.input-select-bass-guitar-tuning');
        this.eInputSelectBassGuitarTuning.value = app.userdata.data.activeProfile.config.instruments["bass-guitar"].tuning;
        this.eInputSelectBassGuitarVisualizer = this.eWrapConfiguration.querySelector('.input-select-bass-guitar-visualizer');
        this.eInputSelectBassGuitarVisualizer.value = app.userdata.data.activeProfile.config.instruments["bass-guitar"].visualizer;
        this.eInputBassGuitarOrderStringsThickAtBottom = this.eWrapConfiguration.querySelector('.input-bass-guitar-order-strings-thick-at-bottom');
        this.eInputBassGuitarOrderStringsThickAtBottom.checked = app.userdata.data.activeProfile.config.instruments["bass-guitar"].orderStringsThickAtBottom == "true";

        /* State */

        /* Events */

        this.acEventListener = new AbortController();
        window.addEventListener("audio-processor-start-song", this.actOnAudioProcessorStartSong.bind(this), { signal: this.acEventListener.signal });
        window.addEventListener("audio-processor-stop-song", this.actOnAudioProcessorStopSong.bind(this), { signal: this.acEventListener.signal });

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

        this.eInputListenToMidi.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                app.userdata.data.activeProfile.config.listenToMidi = e.currentTarget.checked.toString();
            },
            false
        );

        this.eInputListenToInput.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                app.userdata.data.activeProfile.config.listenToInput = e.currentTarget.checked.toString();

                // TODO this must move. Eventually I want some kind of effect pedal audio node chain of which this.micGainNode is part as pre amp, then link that chain to destination.
                if (e.currentTarget.checked) {
                    app.audioProcessor.micGainNode.connect(app.audioProcessor.audioContext.destination);
                    console.log("Connected mic gain to audioContext destination (mic playback).");
                }
                else {
                    app.audioProcessor.micGainNode.disconnect(app.audioProcessor.audioContext.destination);
                    console.log("Disconnected mic gain from audioContext destination (mic playback).");
                }
            },
            false
        );

        this.eInputAudioVolume.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                app.userdata.data.activeProfile.config.audioVolume = e.currentTarget.value.toString();
            },
            false
        );

        this.eInputEnableLightEffects.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                app.userdata.data.activeProfile.config.enableLightEffects = e.currentTarget.checked.toString();
            },
            false
        );
        
        this.eInputSelectInstrument.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
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
                app.userdata.data.activeProfile.config.instruments["bass-guitar"].tuning = e.currentTarget.value;
            },
            false
        );

        this.eInputSelectBassGuitarVisualizer.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                app.userdata.data.activeProfile.config.instruments["bass-guitar"].visualizer = e.currentTarget.value;
            },
            false
        );

        this.eInputBassGuitarOrderStringsThickAtBottom.addEventListener(
            "change",
            (e) => {
                e.preventDefault();
                app.userdata.data.activeProfile.config.instruments["bass-guitar"].orderStringsThickAtBottom = e.currentTarget.checked.toString();
            },
            false
        );

        /* Setup */
        this.updateConfigInstrumentPanels();
    }

    prepareRemoval() {
        this.acEventListener.abort();
        this.element.remove();
        console.log("Prepared removal of self");
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
        // TODO autoformat this how? the html tag function is used by lit-html to highlight html. With it active there is no autoformat of the string itself.
        // const html = (inString) => { return inString };
        // return (html`
        return (`
 
<div class="configuration-page page container">
    <div class="row">
        <div class="col-12">
            <fieldset data-wrap="configuration">
                <legend>Configuration</legend>
                
                <label>
                    <span>Listen to midi:</span>
                    <input class="input-listen-to-midi" type="checkbox"/>
                </label>

                <label>
                    <span>Listen to input:</span>
                    <input class="input-listen-to-input" type="checkbox"/>
                </label>

                <label>
                    <span>Audio volume:</span>
                    <input class="input-audio-volume" type="range"  min="0" max="1" step="0.1" />
                </label>

                <label>
                    <span>Enable light effects:</span>
                    <input class="input-enable-light-effects" type="checkbox"/>
                </label>

                <label>
                    <span>Select an instrument:</span>
                    <select class="input-select-instrument" name="input-select-instrument">
                        <option value="${MidiUtils.instruments.bassGuitar}">Bass guitar</option>
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
                        <span>Select a visualizer:</span>
                        <select class="input-select-bass-guitar-visualizer" name="input-select-bass-guitar-visualizer">
                            <option value="vertical">Vertical</option>
                            <option value="horizontal">Horizontal</option>
                        </select>
                    </label>

                    <label>
                        <span>Order the strings by thickest at the bottom:</span>
                        <input class="input-bass-guitar-order-strings-thick-at-bottom" type="checkbox" checked/>
                    </label>
                </div>
                
                <hr>

                <button class="input-save-profiles button block" type="button">Save progress</button> 

            </fieldset>
        </div>
    </div>
</div>

        `);
    }

    /* Events */

    actOnAudioProcessorStartSong(e) {
        this.eWrapConfiguration.disabled = "true";
    }

    actOnAudioProcessorStopSong(e) {
        this.eWrapConfiguration.removeAttribute("disabled");
    }
}