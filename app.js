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

		this.developerPage.eInputSubmit.addEventListener(
            "click",
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

                this.startGame(e.songTitle);
            },
            false
        );

        window.addEventListener(
            "audio-processor-stop-song",
            (e) => {
                e.preventDefault();

                // First off, we can update the userdata with the data gathered in the audioProcessor.
                // If the audioProcessor was playing a song, we can still access the data.
                // Here we can read data like hit accuracy to write to the profiles, tracking highscores.
                if (this.audioProcessor.songTitle != null) {
                    console.log("Writing song stats to user profile:");
        
                    // Update accuracy if it is a highscore.
                    const newAccuracy = this.audioProcessor.countHitAccuracy;
                    // Check if we have song stats stored, or if we have to create it.
                    if (this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle]) {
                        const oldAccuracy = this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle].accuracy;
                        if (newAccuracy > oldAccuracy) {
                            this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle].accuracy = newAccuracy;
                        } 
                    }
                    else {
                        this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle] = {};
                        this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle].accuracy = newAccuracy;
                    }

        
                    console.log(this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle]);
                }

                // Remove any panels we don't need anymore and regenerate the song list so it shows updated userdata.

                this.navigation.unregisterNavigation("Processing");
                if (this.processingContent) {
                    if (this.processingContent.element) {
                        this.processingContent.element.remove();
                    }
                    this.processingContent = null;
                }
        
                this.navigation.unregisterNavigation("Song List");
                if (this.songList) {
                    this.songList.element.remove();
                }
                this.songList = new SongList();
                this.songList.create(this.element);
                this.navigation.registerNavigation("Song List", "Song List", 1, this.eSongListWrap);
                this.navigation.navigateTo("Song List");
            },
            false
        );
    }

    async startGame(insongTitle) {
        // First stop if required.
        this.stopGame();
        this.startedGame = true;

        // First we need to get the song data from the userdata object.
        if (!this.userdata.isValid()) {
            console.error("Invalid userdata");
            return;
        }

        const songData = this.userdata.data.songs[insongTitle];
        if (songData == null) {
            console.error("The requested song is not present in the userdata.");
            return;
        }

        console.log("Starting song: " + songData.title);

        this.processingContent = new ProcessingContent();
        const bOrderStringsThickAtBottom = this.developerPage.eInputBassGuitarOrderStringsThickAtBottom.checked;
        const bColorStrings = this.developerPage.eInputBassGuitarColorStrings.checked;
		this.processingContent.create(this.element, bOrderStringsThickAtBottom, bColorStrings);
        this.navigation.registerNavigation("Processing", "Processing", 2, this.eProcessingContentWrap);
        this.navigation.navigateTo("Processing");

        const stringMidiOffsets = this.developerPage.eInputSelectBassGuitarTuning.value.split(",");
        const bListenToMidi = this.developerPage.eInputListenToMidi.checked;

        await this.audioProcessor.startSong(songData, stringMidiOffsets, bListenToMidi);
    }

    stopGame() {
        if (!this.startedGame) {
            return;
        }

        this.audioProcessor.stopSong();
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