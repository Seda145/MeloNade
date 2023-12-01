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
            const albumImageUrl = URL.createObjectURL(value.albumImage);
            let newSongEntry = UIUtils.createElement('<div class="song-entry" data-song-name="' + value.name + '"><span class="song-name">' + value.name + '</span><img class="album-image" src="' + albumImageUrl + '"></div>');

            // When we click on a song in the list, broadcast its name.
            newSongEntry.addEventListener(
                "click",
                (e) => {
                    e.preventDefault();

                    const songName = e.currentTarget.dataset.songName;
                    console.log("Song list chose a song: " + songName);
                    let songListChoseSongEvent = new Event('song-list-chose-song', { bubbles: false });
                    songListChoseSongEvent.songName = songName;
                    window.dispatchEvent(songListChoseSongEvent);
                },
                false
            );

            this.element.appendChild(newSongEntry);
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