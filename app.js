/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class MyApp {
	constructor() {
        this.userdata = new Userdata();
        this.startedGame = false;
	}

	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="app"]'), this.getHTMLTemplate());
        this.eLoadUserdataWrap = this.element.querySelector('[data-component="load-userdata"]');
        this.eDeveloperPageWrap = this.element.querySelector('[data-component="developer-page"]');
        this.eSongListWrap = this.element.querySelector('[data-component="song-list"]');
        this.eProcessingContentWrap = this.element.querySelector('[data-component="processing-content"]');

        this.audioProcessor = new AudioProcessor();

		this.loadUserdata = new LoadUserdata();
		this.loadUserdata.create(this.element);

		this.navigation = new Navigation();
		this.navigation.create(this.element);
		this.navigation.registerNavigation("Load Userdata", null, 0, this.eLoadUserdataWrap);
		this.navigation.navigateTo("Load Userdata");

		/* Events */

        window.addEventListener(
            "userdata-updated-data",
            async (e) => {
                e.preventDefault();

                console.log("got valid userdata:");
                console.log(app.userdata);

                // No need anymore for the uploader, remove it.
                this.navigation.unregisterNavigation("Load Userdata");
                this.loadUserdata.element.remove();
                this.loadUserdata = null;

                // Create the developer page.
                this.developerPage = new DeveloperPage();
                this.developerPage.create(this.element);

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
                        this.navigation.registerNavigation("Song List", "Song List", 1, this.eSongListWrap);
                        this.navigation.navigateTo("Song List");
                    },
                    false
                );

                this.navigation.registerNavigation("Developer", "Developer", 0, this.eDeveloperPageWrap);
                this.navigation.navigateTo("Developer");
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
                if (this.audioProcessor.songTitle != null) {
                    console.log("Writing song stats to user profile:");
        
                    // Update total hit percentage if it is a highscore.
                    // Check if we have song stats stored, or if we have to create it.
                    const newHitTotalPercentage = this.audioProcessor.countHitTotalPercentage;
                    if (this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle]) {
                        const oldHitTotalPercentage = this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle].hitTotalPercentage;
                        if (newHitTotalPercentage > oldHitTotalPercentage) {
                            this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle].hitTotalPercentage = newHitTotalPercentage;
                        } 
                    }
                    else {
                        this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle] = {};
                        this.userdata.data.activeProfile.songStats[this.audioProcessor.songTitle].hitTotalPercentage = newHitTotalPercentage;
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
        <div data-component="load-userdata" class="hide"></div>
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