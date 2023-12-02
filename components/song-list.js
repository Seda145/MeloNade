/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class SongList {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="song-list"]'), this.getHTMLTemplate());
       
        if (!app.userdata.isValid()) {
            console.error("Can't generate song list. app.userdata is invalid.");
            return;
        }

        // Generate song data

        this.element.innerHTML = "";

        for (const [key, value] of Object.entries(app.userdata.data.songs)) { 
            let songListEntryX = new SongListEntry();
            songListEntryX.create(value.title);
            this.element.appendChild(songListEntryX.element);

            // When we click on a song in the list, broadcast its name.
            songListEntryX.element.addEventListener(
                "click",
                (e) => {
                    e.preventDefault();

                    const songTitle = e.currentTarget.dataset.songTitle;
                    console.log("Song list chose a song: " + songTitle);
                    let songListChoseSongEvent = new Event('song-list-chose-song', { bubbles: false });
                    songListChoseSongEvent.songTitle = songTitle;
                    window.dispatchEvent(songListChoseSongEvent);
                },
                false
            );
        }
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="main-wrap song-list fieldstyle">

</div>


        `);
    }
}