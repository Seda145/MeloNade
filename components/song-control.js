/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class SongControl {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="song-control"]'), this.getHTMLTemplate());

        this.eNowPlayingSong = this.element.querySelector(".now-playing-song");
        this.eButtonTogglePlay = this.element.querySelector(".button[data-action='toggle-play']");
        this.eButtonStopPlay = this.element.querySelector(".button[data-action='stop-play']");

        /* Events */

        this.acEventListener = new AbortController();
		window.addEventListener("audio-processor-start-song", this.actOnAudioProcessorStartSong.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("audio-processor-play-after-start-delay", this.actOnAudioProcessorPlayAfterStartDelay.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("audio-processor-stop-song", this.actOnAudioProcessorStopSong.bind(this), { signal: this.acEventListener.signal });

        this.eButtonTogglePlay.addEventListener(
            "click",
            (e) => {
                if (!app.audioProcessor.isPlaying || !app.audioProcessor.audio) {
                    return;
                }

                if (this.eButtonTogglePlay.classList.contains("pause")) {
                    // console.log("song controls: pause");
                    app.audioProcessor.pauseSong();
                    if (app.audioProcessor.audio.paused) {
                        this.eButtonTogglePlay.classList.remove("pause");
                        this.eButtonTogglePlay.classList.add("play");
                    }
                }
                else {
                    // console.log("song controls: play");
                    app.audioProcessor.unpauseSong();
                    if (!app.audioProcessor.audio.paused) {
                        this.eButtonTogglePlay.classList.remove("play");
                        this.eButtonTogglePlay.classList.add("pause");
                    }
                }
            }
        );

        this.eButtonStopPlay.addEventListener(
            "click",
            (e) => {
                // console.log("song controls: stop");
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
            <div class="button pause" data-action="toggle-play"></div>
            <div class="button stop" data-action="stop-play"></div>
        </div>
    </div>
</div>


        `);
    }

    /* Events */

    actOnAudioProcessorStartSong(e) {
        this.eNowPlayingSong.textContent = app.audioProcessor.songTitle;
        // There is a planned timeout when the song starts initially in the audioprocessor. 
        // During that timeout the pause / play button would have no effect.
        // It's probably better to just hide or disable it during the delay than to add further complexity.
        this.eButtonTogglePlay.classList.add("hide");
    }

    actOnAudioProcessorPlayAfterStartDelay(e) {
        this.eButtonTogglePlay.classList.remove("hide");
    }

    actOnAudioProcessorStopSong(e) {
        this.eButtonTogglePlay.classList.add("hide");
        this.eNowPlayingSong.textContent = "-";
    }    
}
