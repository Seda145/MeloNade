/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class SongListEntry {
	create(inSongTitle, inMidiTrackIndex) {
        this.songTitle = inSongTitle;
        this.midiTrackIndex = inMidiTrackIndex;
        const songStats = app.userdata.data.activeProfile.songStats[this.songTitle];
        this.hitTotalPercentage = 0;
        if (songStats) {
            // If we have already saved data in the stats, grab it to display it.
            this.hitTotalPercentage = app.userdata.data.activeProfile.songStats[this.songTitle].hitTotalPercentage;
        }
        this.albumImageUrl = "";
        if (app.userdata.data.songs[this.songTitle].albumImage) {
            // If the user added an image for the album, grab it.
            this.albumImageUrl = URL.createObjectURL(app.userdata.data.songs[this.songTitle].albumImage);
        }
		this.element = UIUtils.createElement(this.getHTMLTemplate());
    }

    prepareRemoval() {
        this.element.remove();
        console.log("Prepared removal of self");
    }

    getHTMLTemplate() {
        // TODO autoformat this how? the html tag function is used by lit-html to highlight html. With it active there is no autoformat of the string itself.
        // const html = (inStrings, inSongTitle, inAlbumImageUrl) => { return `${inStrings[0]}${inSongTitle}${inStrings[1]}${this.hitTotalPercentage}${inStrings[2]}${inAlbumImageUrl}${inStrings[3]}`; };
        // const html = (inString) => { return inString };
        // return (html`
        return (`
 
 <div class="song-list-entry" data-midi-track-index="${this.midiTrackIndex}" data-song-title="${this.songTitle}"><span class="title">${this.songTitle}</span><span class="completed-percentage">Completed: ${this.hitTotalPercentage}%</span><img class="album-image" src="${this.albumImageUrl}"></div>

        `);
    }
}