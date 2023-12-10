/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class SongList {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="song-list"]'), this.getHTMLTemplate());
		
        /* Events */

		this.acEventListener = new AbortController();
        window.addEventListener("navigation-navigated", this.actOnNavigationNavigtated.bind(this), { signal: this.acEventListener.signal });
    }

    prepareRemoval() {
        this.acEventListener.abort();
        this.element.remove();
        console.log("Prepared removal of self");
    }

    async regenerateSongEntries() {
        if (!app.userdata.isValid()) {
            console.error("Can't generate song list. app.userdata is invalid.");
            return;
        }

        // Generate song data

        if (!this.element) {
            return;
        }

        this.element.innerHTML = "";

        for (const [key, value] of Object.entries(app.userdata.data.songs)) { 
            // We need to read the midi quickly to check if it contains a track supporting the instrument we are currently using.
            const midiX = await Midi.fromUrl(URL.createObjectURL(value.midi));
            let midiTrackIndex = null;
            for (let i = 0; i < midiX.tracks.length; i++) {
                const instrument = MidiUtils.getImplementedInstrumentForInstrumentCode(midiX.tracks[i].instrument.number);

                if (instrument != null && instrument == app.userdata.data.activeProfile.config.currentInstrument) {
                    // Found a midi track which matches the instrument we are playing. We can use this song list entry.
                    midiTrackIndex = i;
                    break;
                }
            }

            if (midiTrackIndex == null) {
                console.log("Found a song which has no midi track matching the implemented instrument we are using: " + value.title);
                continue;
            }

            let songListEntryX = new SongListEntry();
            songListEntryX.create(value.title, midiTrackIndex);
            this.element.appendChild(songListEntryX.element);

            // When we click on a song in the list, broadcast its name.
            songListEntryX.element.addEventListener(
                "click",
                (e) => {
                    e.preventDefault();

                    const songTitle = e.currentTarget.dataset.songTitle;
                    const midiTrackIndex = e.currentTarget.dataset.midiTrackIndex;
                    console.log("Song list chose a song: " + songTitle);
                    let songListChoseSongEvent = new Event('song-list-chose-song', { bubbles: false });
                    songListChoseSongEvent.songTitle = songTitle;
                    songListChoseSongEvent.midiTrackIndex = midiTrackIndex;
                    window.dispatchEvent(songListChoseSongEvent);
                },
                false
            );
        }
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="song-list page container">

</div>


        `);
    }

    /* Events */

    actOnNavigationNavigtated(e) {
        if (e.navigatedTo != "Song List") {
            // Irrelevant event.
            return;
        }
        console.log("Song List responds to navigation event, to update its song entries.");

        // Todo
        // I would rather respond to a change in userdata so we know the song list has to be updated to relevant values.
        // It would require getter / setters on the Userdata or some implementation of observer pattern.
        this.regenerateSongEntries();
    }

}