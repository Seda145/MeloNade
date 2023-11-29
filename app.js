/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

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
        this.userdata = new Userdata();
        this.startedGame = false;
	}

	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="app"]'), this.getHTMLTemplate());
        this.eDeveloperPageWrap = this.element.querySelector('[data-component="developer-page"]');
        this.eSongListWrap = this.element.querySelector('[data-component="song-list"]');
        this.eProcessingContentWrap = this.element.querySelector('[data-component="processing-content"]');

        this.audioProcessor = new AudioProcessor();

		this.developerPage = new DeveloperPage();
		this.developerPage.create(this.element);

		this.navigation = new Navigation();
		this.navigation.create(this.element);
		this.navigation.registerNavigation("Developer", null, 0, this.eDeveloperPageWrap);
		this.navigation.navigateTo("Developer");

		/* Events */

		this.developerPage.eDeveloperPageForm.addEventListener(
            "submit",
            async (e) => {
                e.preventDefault();
    
                if (!this.userdata.isValid()) {
                    console.error("Invalid userdata");
                    return;
                }
                
                if (this.songList) {
                    this.songList.element.remove();
                }
                this.songList = new SongList();
                this.songList.create(this.element);
		        this.navigation.registerNavigation("Developer", "Developer", 0, this.eDeveloperPageWrap);
		        this.navigation.registerNavigation("Song List", "Song List", 1, this.eSongListWrap);
                this.navigation.navigateTo("Song List");
            },
            false
        );

        window.addEventListener(
            "song-list-chose-song",
            (e) => {
                e.preventDefault();

                this.startGame(e.songName);
            },
            false
        );
    }

    async startGame(inSongName) {
        // First stop if required.
        this.stopGame();
        this.startedGame = true;

        // First we need to get the song data from the userdata object.
        // TODO At this point it is assumed we have injected a valid userdata object already through the developer page.
        // For now we can say if this.userdata == null it hasn't been set, else it's validated there.
        if (!this.userdata.isValid()) {
            console.error("Invalid userdata");
            return;
        }

        const songData = this.userdata.data.songs[inSongName];
        if (songData == null) {
            console.error("The requested song is not present in the userdata.");
            return;
        }

        console.log("Starting song: " + songData.name);

        this.processingContent = new ProcessingContent();
        const bOrderStringsThickAtBottom = this.developerPage.eInputBassGuitarOrderStringsThickAtBottom.checked;
        const bColorStrings = this.developerPage.eInputBassGuitarColorStrings.checked;
		this.processingContent.create(this.element, bOrderStringsThickAtBottom, bColorStrings);
        this.navigation.registerNavigation("Processing", "Processing", 2, this.eProcessingContentWrap);
        this.navigation.navigateTo("Processing");

        let newAudio = new Audio(URL.createObjectURL(songData.audio));
        const midiObj = await midiUtils.formatMidiFile(songData.midi);

        const stringMidiOffsets = this.developerPage.eInputSelectBassGuitarTuning.value.split(",");
        const bListenToMidi = this.developerPage.eInputListenToMidi.checked;

        this.audioProcessor.restartAudio(newAudio, midiObj, stringMidiOffsets, bListenToMidi);
    }

    stopGame() {
        if (!this.startedGame) {
            return;
        }

        if (this.processingContent) {
            if (this.processingContent.element) {
                this.processingContent.element.remove();
            }
            this.processingContent = null;
        }

        this.audioProcessor.stopAudio();

        this.startedGame = false;
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div id="app-wrap">
    <header></header>

    <main class="main-wrap container">
        <div data-component="developer-page" class="hide"></div>
        <div data-component="song-list" class="hide"></div>
		<div data-component="processing-content" class="hide"></div>
		<div data-component="navigation"></div>
    </main>

    <footer></footer>
</div>

        `);
    }
}


const app = new MyApp();
app.create(document);