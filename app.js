/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

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
        
        const newMidiUrl = URL.createObjectURL(songData.midi);
        // https://github.com/Tonejs/Midi
        const newMidi = await Midi.fromUrl(newMidiUrl);

        const stringMidiOffsets = this.developerPage.eInputSelectBassGuitarTuning.value.split(",");
        const bListenToMidi = this.developerPage.eInputListenToMidi.checked;

        this.audioProcessor.restartAudio(newAudio, newMidi, stringMidiOffsets, bListenToMidi);
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