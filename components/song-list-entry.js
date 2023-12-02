/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class SongListEntry {
	create(inSongTitle) {
        this.songTitle = inSongTitle;
        const songStats = app.userdata.data.activeProfile.songStats[this.songTitle];
        this.songAccuracy = 0;
        if (songStats) {
            // If we have already saved data in the stats, grab it to display it.
            this.songAccuracy = app.userdata.data.activeProfile.songStats[this.songTitle].accuracy;
        }
        this.albumImageUrl = "";
        if (app.userdata.data.songs[this.songTitle].albumImage) {
            // If the user added an image for the album, grab it.
            this.albumImageUrl = URL.createObjectURL(app.userdata.data.songs[this.songTitle].albumImage);
        }
		this.element = UIUtils.createElement(this.getHTMLTemplate());
    }

    getHTMLTemplate() {
        // TODO autoformat this how? the html tag function is used by lit-html to highlight html. With it active there is no autoformat of the string itself.
        // const html = (inStrings, inSongTitle, inAlbumImageUrl) => { return `${inStrings[0]}${inSongTitle}${inStrings[1]}${this.songAccuracy}${inStrings[2]}${inAlbumImageUrl}${inStrings[3]}`; };
        // const html = (inString) => { return inString };
        // return (html`
        return (`
 
 <div class="song-list-entry" data-song-title="${this.songTitle}"><span class="title">${this.songTitle}</span><span class="accuracy">Accuracy: ${this.songAccuracy}</span><img class="album-image" src="${this.albumImageUrl}"></div>

        `);
    }
}