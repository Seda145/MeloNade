/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class SongControl {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="song-control"]'), this.getHTMLTemplate());

        this.eNowPlayingSong = this.element.querySelector(".now-playing-song");
        // this.eButtonTogglePlay = this.element.querySelector(".button[data-action='toggle-play']");
        this.eButtonStopPlay = this.element.querySelector(".button[data-action='stop-play']");

        /* Events */

        this.acEventListener = new AbortController();
		window.addEventListener("audio-processor-start-song", this.actOnAudioProcessorStartSong.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("audio-processor-stop-song", this.actOnAudioProcessorStopSong.bind(this), { signal: this.acEventListener.signal });

        // this.eButtonTogglePlay.addEventListener(
        //     "click",
        //     (e) => {
        //         if (this.eButtonTogglePlay.classList.contains("pause")) {
        //             this.eButtonTogglePlay.classList.remove("pause");
        //             this.eButtonTogglePlay.classList.add("play");
        //             console.log("song controls: pause");
        //             app.audioProcessor.pauseSong();
        //         }
        //         else {
        //             this.eButtonTogglePlay.classList.remove("play");
        //             this.eButtonTogglePlay.classList.add("pause");
        //             console.log("song controls: play");
        //         }
        //     }
        // );

        this.eButtonStopPlay.addEventListener(
            "click",
            (e) => {
                console.log("song controls: stop");
                app.audioProcessor.stopSong();
            }
        );
    }

	prepareRemoval() {
        this.acEventListener.abort();
        this.element.remove();
		console.log("Prepared removal of self");
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
    
<div class="song-control">
    <div class="control-wrap">
        <div class="display">
            <span class="now-playing">Now Playing:</span>
            <span class="now-playing-song">-</span>
        </div>
        <div class="buttons">
            <!-- <div class="button pause" data-action="toggle-play"></div> -->
            <div class="button stop" data-action="stop-play"></div>
        </div>
    </div>
</div>


        `);
    }

    /* Events */

    actOnAudioProcessorStartSong(e) {
        this.eNowPlayingSong.textContent = app.audioProcessor.songTitle;
    }

    actOnAudioProcessorStopSong(e) {
        this.eNowPlayingSong.textContent = "-";
    }    
}
