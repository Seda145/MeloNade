/**[[ Copyright Roy Wierer (Seda145) ]]**/

// External DOCS
// https://web.dev/articles/media-recording-audio
// https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3
// https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
// https://webaudio.github.io/web-audio-api/
// https://tonejs.github.io/
// https://github.com/Tonejs/Midi
// https://github.com/carter-thaxton/midi-file
// https://github.com/surikov/webaudiofont
// https://surikov.github.io/webaudiofont/examples/midiplayer.html#
// https://github.com/WebAudio/web-midi-api/issues/232
// https://stackoverflow.com/questions/41753349/convert-midi-file-to-list-of-notes-with-length-and-starting-time?rq=3
// https://forum.metasystem.io/forum/metagrid-pro/beta/issues/2981-c-2-c-1-midi-notes-lower-keyboard-range-question
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
// https://stackoverflow.com/questions/69237143/how-do-i-get-the-audio-frequency-from-my-mic-using-javascript
// https://newt.phys.unsw.edu.au/music/note/
// https://newt.phys.unsw.edu.au/jw/notes.html
// https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
// https://stackoverflow.com/questions/40314457/audiobuffers-getchanneldata-equivalent-for-mediastream-or-mediastreamaudio
// https://github.com/dglazkov/webcomponents/blob/html-modules/proposals/HTML-Imports-and-ES-Modules.md
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// https://medium.com/samsung-internet-dev/html-and-templates-javascript-template-literals-2d7494ea3e6
// https://www.w3schools.com/js/js_string_templates.asp
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
// https://forum.metasystem.io/forum/metagrid-pro/beta/issues/2981-c-2-c-1-midi-notes-lower-keyboard-range-question
// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
// https://en.wikipedia.org/wiki/List_of_guitar_tunings


class MyApp {
	constructor() {
		/* State */
		this.fps = 60;
		this.msForfps = 1 / this.fps * 1000;
	}

	create(inParentID) {
		this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
        this.eDeveloperPageWrap = this.element.querySelector("#developer-page-wrap");
        this.eProcessingContentWrap = this.element.querySelector("#processing-content-wrap");

		this.developerPage = new DeveloperPage();
		this.developerPage.create("developer-page-wrap");

		this.navigation = new Navigation();
		this.navigation.create("navigation-wrap");
		this.navigation.registerNavigation(0, "Developer", this.eDeveloperPageWrap);
		this.navigation.registerNavigation(1, "Processing", this.eProcessingContentWrap);
		this.navigation.navigateTo(0);

		/* Events */

		this.developerPage.eDeveloperPageForm.addEventListener(
            "submit",
            async (e) => {
                e.preventDefault();
    
                this.stopGame();
                await this.startGame();
            },
            false
        );

        
        window.addEventListener(
			"audio-processor-restarts-audio",
			(e) => {
				e.preventDefault();
				this.navigation.navigateTo(1);
			},
			false
		);
    }

    async startGame() {
        this.audioProcessor = new AudioProcessor();

        this.processingContent = new ProcessingContent();
		this.processingContent.create("processing-content-wrap", this.developerPage.eInputBassGuitarOrderStringsThickAtBottom.checked);

        console.log("Setting audio source.");
        const audioFile = this.developerPage.eInputDeveloperPageAudio.files[0];
        let newAudio = new Audio(URL.createObjectURL(audioFile));
        
        console.log("Loading MIDI object.");
        const midiObj = await midiUtils.formatMidiFile(this.developerPage.eInputDeveloperPageMidi.files[0]);

        const stringMidiOffsets = this.developerPage.eInputSelectBassGuitarTuning.value.split(",");
        const bListenToMidi = this.developerPage.eInputListenToMidi.checked;
        this.audioProcessor.restartAudio(newAudio, midiObj, stringMidiOffsets, bListenToMidi);
    }

    stopGame() {
        if (this.processingContent) {
            if (this.processingContent.element) {
                this.processingContent.element.remove();
            }
            this.processingContent = null;
        }

        if (this.audioProcessor) {
            this.audioProcessor.stopAudio();
            this.audioProcessor = null;
        }
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div id="app-wrap">
    <header></header>

    <main class="main-wrap container">
        <div id="developer-page-wrap" class="hide"></div>
		<div id="processing-content-wrap" class="hide"></div>
		<div id="navigation-wrap"></div>
    </main>

    <footer></footer>
</div>

        `);
    }
}


const app = new MyApp();
app.create("app-wrap");