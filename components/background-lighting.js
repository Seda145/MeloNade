/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class BackgroundLighting {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="background-lighting"]'), this.getHTMLTemplate());
		this.eStageBackground = this.element.querySelector('.stage-background');
		this.eStageSpots = this.element.querySelector('.stage-spots');
		/* State */
		this.initialStageColorBottom = 'rgb(1, 0, 0)';
		this.initialStageColorCenter = 'rgb(28, 10, 10)';
		this.initialStageColorTop = 'rgb(43, 22, 22)';
		this.alphaStages = [
			{
				color: 'rgb(80, 25, 25)',
				spotIntensityA: 1.85,
				spotIntensityB: 2.1,
				spotWhiteAddition: 60,
				spotAngle: 100
			},
			{
				color: 'rgb(105, 10, 30)',
				spotIntensityA: 1.75,
				spotIntensityB: 2.1,
				spotWhiteAddition: 70,
				spotAngle: 110
			},
			{
				color: 'rgb(90, 20, 25)',
				spotIntensityA: 1.9,
				spotIntensityB: 2.1,
				spotWhiteAddition: 70,
				spotAngle: 90
			},
			{
				color: 'rgb(18, 4, 32)',
				spotIntensityA: 1.75,
				spotIntensityB: 2.0,
				spotWhiteAddition: 60,
				spotAngle: 105
			},
			{
				color: 'rgb(105, 10, 30)',
				spotIntensityA: 1.75,
				spotIntensityB: 2.1,
				spotWhiteAddition: 70,
				spotAngle: 110
			},
			{
				color: this.initialStageColorCenter,
				spotIntensityA: 1.75,
				spotIntensityB: 2.0,
				spotWhiteAddition: 110,
				spotAngle: 100
			}
		];
		this.audioAlpha = 0;
		this.normalizedAudioAlpha = 0;
		this.curAlphaStage = 0;
		this.interpolatedAlphaStageData = null;

        window.addEventListener(
			"audio-processor-start-song",
			(e) => {
				e.preventDefault();
				this.start();
			},
			false
		);

		window.addEventListener(
			"audio-processor-stop-song",
			(e) => {
				e.preventDefault();
				this.stop();
			},
			false
		);
    }
	
    start() {
		if (app.userdata.data.activeProfile.config.enableLightEffects == "true") {
			this.draw();
		}
	}

    stop() {
		window.cancelAnimationFrame(this.requestAnimationDrawFrame);
		// Once the audio stops, the background will still be visible. It should be reset to default values now that the draw method no longer runs.
		this.stopStageBackground();
		this.stopStageSpots();
	}

	draw() {
		this.requestAnimationDrawFrame = window.requestAnimationFrame(() => { this.draw(); });
		this.interpolateAlphaData();
		this.drawStageBackground();
		this.drawStageSpots();
    }

	interpolateAlphaData() {
		this.audioAlpha = app.audioProcessor.audio.currentTime / app.audioProcessor.audio.duration;
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
		newData.spotIntensityB = MathUtils.lerp(curData.spotIntensityB, nextData.spotIntensityB, this.normalizedAudioAlpha);
		newData.spotWhiteAddition = MathUtils.lerp(curData.spotWhiteAddition, nextData.spotWhiteAddition, this.normalizedAudioAlpha);
		newData.spotAngle = MathUtils.lerp(curData.spotAngle, nextData.spotAngle, this.normalizedAudioAlpha);
		this.interpolatedAlphaStageData = newData;
	}

	getAlphaStageData(inAlphaStage) {
		// Clamp to the start and end of the data.
		return this.alphaStages[MathUtils.clamp(inAlphaStage, 0, this.alphaStages.length -1)];
	}

	stopStageBackground() {
		this.eStageBackground.style.opacity = 0;
	}

	drawStageBackground() {
		// Calculate the center color, which is the main "ambience" of the room.
		this.eStageBackground.style.opacity = 1;
		this.eStageBackground.style.backgroundImage = `
			linear-gradient(0deg, ${this.initialStageColorBottom} 10%, ${this.interpolatedAlphaStageData.color} 40%, ${this.interpolatedAlphaStageData.color} 50%, ${this.initialStageColorTop} 100%)		
		`;
	}

	stopStageSpots() {
		this.eStageSpots.style.opacity = 0;
	}

	drawStageSpots() {
		this.eStageSpots.style.opacity = 1;

		// Vertical spot beams gradient, then fading beams gradient to the bottom.
		this.eStageSpots.style.maskImage = `
			repeating-linear-gradient(${this.interpolatedAlphaStageData.spotAngle}deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 5%, rgba(0, 0, 0, 0.4), 15%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 30%), 
			linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, .9) 45%, rgba(0, 0, 0, 0.05) 80%)
		`;

		let spotColorAObj = UIUtils.getCssRGBAsObject(this.interpolatedAlphaStageData.color);
		// Alter color or intensity a bit on the light.
		spotColorAObj.r = Math.min(255, spotColorAObj.r * this.interpolatedAlphaStageData.spotIntensityA + this.interpolatedAlphaStageData.spotWhiteAddition);
		spotColorAObj.g = Math.min(255, spotColorAObj.g * this.interpolatedAlphaStageData.spotIntensityA + this.interpolatedAlphaStageData.spotWhiteAddition);
		spotColorAObj.b = Math.min(255, spotColorAObj.b * this.interpolatedAlphaStageData.spotIntensityA + this.interpolatedAlphaStageData.spotWhiteAddition);

		let spotColorBObj = UIUtils.getCssRGBAsObject(this.interpolatedAlphaStageData.color);
		// Alter color or intensity a bit on the light.
		spotColorBObj.r = Math.min(255, spotColorBObj.r * this.interpolatedAlphaStageData.spotIntensityB + this.interpolatedAlphaStageData.spotWhiteAddition);
		spotColorBObj.g = Math.min(255, spotColorBObj.g * this.interpolatedAlphaStageData.spotIntensityB + this.interpolatedAlphaStageData.spotWhiteAddition);
		spotColorBObj.b = Math.min(255, spotColorBObj.b * this.interpolatedAlphaStageData.spotIntensityB + this.interpolatedAlphaStageData.spotWhiteAddition);

		const spotColorA = UIUtils.getRGBObjectAsCss(spotColorAObj);
		const spotColorB = UIUtils.getRGBObjectAsCss(spotColorBObj);
		// console.log(spotColorA);

		// Light beam horizontal strength variation and color.
		this.eStageSpots.style.backgroundImage = `
			linear-gradient(100deg, ${spotColorA}, ${spotColorB})
		`;
	}

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="background-lighting">
	<div class="static-background"></div>
	<div class="stage-background"></div>
	<div class="stage-spots"></div>
</div>


        `);
    }
}