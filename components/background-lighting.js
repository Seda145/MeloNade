/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class BackgroundLighting {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="background-lighting"]'), this.getHTMLTemplate());
		this.eStageBackground = this.element.querySelector('.stage-background');
		/* State */
		this.initialStageColorBottom = 'rgb(1, 0, 0)';
		this.initialStageColorCenter = 'rgb(28, 10, 10)';
		this.initialStageColorTop = 'rgb(43, 22, 22)';
		this.alphaStages = [
			{
				color: 'rgb(80, 25, 25)',
				spotIntensityA: 1.6,
				spotWhiteAddition: 10,
				spotAngle: 100
			},
			{
				color: 'rgb(105, 10, 30)',
				spotIntensityA: 1.7,
				spotWhiteAddition: 20,
				spotAngle: 110
			},
			{
				color: 'rgb(90, 20, 25)',
				spotIntensityA: 1.8,
				spotWhiteAddition: 15,
				spotAngle: 90
			},
			{
				color: 'rgb(18, 4, 32)',
				spotIntensityA: 1.55,
				spotWhiteAddition: 10,
				spotAngle: 105
			},
			{
				color: 'rgb(105, 10, 30)',
				spotIntensityA: 1.65,
				spotWhiteAddition: 0,
				spotAngle: 110
			},
			{
				color: this.initialStageColorCenter,
				spotIntensityA: 1.75,
				spotWhiteAddition: 30,
				spotAngle: 100
			}
		];
		this.audioAlpha = 0;
		this.normalizedAudioAlpha = 0;
		this.curAlphaStage = 0;
		this.interpolatedAlphaStageData = this.alphaStages[0];

		/* Events */

		this.acEventListener = new AbortController();
		window.addEventListener("audio-processor-start-song", this.actOnAudioProcessorStartSong.bind(this), { signal: this.acEventListener.signal });
		window.addEventListener("audio-processor-stop-song", this.actOnAudioProcessorStopSong.bind(this), { signal: this.acEventListener.signal });
	}
	
	prepareRemoval() {
		this.acEventListener.abort();
        this.element.remove();
		console.log("Prepared removal of self");
    }

	async draw() {
		await this.interpolateAlphaData();
		this.drawStage();
		
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });
    }

	async interpolateAlphaData() {
		if (!app.audioProcessor || !app.audioProcessor.audio) {
			return;
		}
		{
			// Somehow the currentTime and duration properties can be undefined when audio is not.
			// This happens a few frames when the audio starts playing, so we can't interpolate then.
			const newAudioAlpha = app.audioProcessor.audio.currentTime / app.audioProcessor.audio.duration;
			if (isNaN(newAudioAlpha)) {
				console.error("audio alpha is not a number. This should not happen, is the audio loaded?");
				return;
			}

			this.audioAlpha = newAudioAlpha;
		}

		this.curAlphaStage = Math.max(0, Math.floor(this.alphaStages.length * this.audioAlpha));

		// console.log("current stage: " + this.curAlphaStage);

		// We normalize the alpha of the current position of the audio, to the start of the current stage and the start of the next stage. 
		// This way we get a 0 to 1 alpha between stages that is controlled by the current audio position, where each stage starts at 0 and ends at 1.
		this.normalizedAudioAlpha = MathUtils.normalizeToAlpha(this.audioAlpha, this.curAlphaStage / this.alphaStages.length, (this.curAlphaStage + 1) / this.alphaStages.length);
		// console.log("current stage: " + this.curAlphaStage + ", normalizedAudioAlpha: " + this.normalizedAudioAlpha);

		// Interpolate the data of the current alpha stage to the data of the next.
		const curData = this.getAlphaStageData(this.curAlphaStage);
		const nextData = this.getAlphaStageData(this.curAlphaStage + 1);
		let newData = {};
		newData.color = UIUtils.getRGBObjectAsCss(UIUtils.interpolateRGBAsObjects(curData.color, nextData.color, this.normalizedAudioAlpha));
		newData.spotIntensityA = MathUtils.lerp(curData.spotIntensityA, nextData.spotIntensityA, this.normalizedAudioAlpha);
		newData.spotWhiteAddition = MathUtils.lerp(curData.spotWhiteAddition, nextData.spotWhiteAddition, this.normalizedAudioAlpha);
		newData.spotAngle = MathUtils.lerp(curData.spotAngle, nextData.spotAngle, this.normalizedAudioAlpha);
		this.interpolatedAlphaStageData = newData;
	}

	getAlphaStageData(inAlphaStage) {
		// Clamp to the start and end of the data.
		return this.alphaStages[MathUtils.clamp(inAlphaStage, 0, this.alphaStages.length -1)];
	}

	stopStage() {
		this.eStageBackground.style.opacity = 0;
	}

	drawStage() {
		// Calculate the center color, which is the main "ambience" of the room.
		this.eStageBackground.style.opacity = 1;

		let spotColorAObj = UIUtils.getCssRGBAsObject(this.interpolatedAlphaStageData.color);
		// Alter color or intensity a bit on the light.
		spotColorAObj.r = Math.min(255, spotColorAObj.r * this.interpolatedAlphaStageData.spotIntensityA + this.interpolatedAlphaStageData.spotWhiteAddition);
		spotColorAObj.g = Math.min(255, spotColorAObj.g * this.interpolatedAlphaStageData.spotIntensityA + this.interpolatedAlphaStageData.spotWhiteAddition);
		spotColorAObj.b = Math.min(255, spotColorAObj.b * this.interpolatedAlphaStageData.spotIntensityA + this.interpolatedAlphaStageData.spotWhiteAddition);

		const spotColorA = UIUtils.getRGBObjectAsCss(spotColorAObj);
		// console.log(spotColorA);

		// 1. Base stage color. 2. Repeating vertical light beams, 3. fade to bottom.
		this.eStageBackground.style.backgroundImage = `
			linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 45%, ${this.initialStageColorBottom} 80%),
			repeating-linear-gradient(${this.interpolatedAlphaStageData.spotAngle}deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 5%, ${spotColorA} 15%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 30%), 
			linear-gradient(0deg, ${this.initialStageColorBottom} 10%, ${this.interpolatedAlphaStageData.color} 40%, ${this.interpolatedAlphaStageData.color} 50%, ${this.initialStageColorTop} 100%)
		`;
	}

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="background-lighting">
	<div class="static-background"></div>
	<div class="stage-background"></div>
</div>


        `);
    }

	/* Events */

	actOnAudioProcessorStartSong(e) {
		if (app.userdata.data.activeProfile.config.enableLightEffects == "true") {
			this.draw();
		}
	}

	actOnAudioProcessorStopSong(e) {
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
		// Once the audio stops, the background will still be visible. It should be reset to default values now that the draw method no longer runs.
		this.stopStage();
	}
}