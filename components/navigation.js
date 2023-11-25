class Navigation {
	constructor() {
		this.panels = [];
		this.activePanelId = -1;
	}

	registerNavigation(inContentId, inTitle, inElement) {
		this.panels[inContentId] = inElement;

		let newTab = UIUtils.createElement('<span class="tab" data-contentid="' + inContentId + '">' + inTitle + '</span>');
		this.eTabs.appendChild(newTab);

		newTab.addEventListener(
			"click",
			(e) => {
				this.navigateTo(e.target.dataset.contentid);
			}
		);

		// console.log("Registered navigation at ID: " + inContentId);
	}

	navigateTo(inContentId) {
		console.log("Navigation to: " + inContentId);

		let activePanel = this.panels[this.activePanelId];
		if (activePanel) {
			UIUtils.updateVisibility(activePanel, false);
		}
		let newPanel = this.panels[inContentId];
		if (newPanel) {
			UIUtils.updateVisibility(newPanel, true);
			this.activePanelId = inContentId;
		}
		else {
			console.error("Navigation error, this contentId (" + inContentId + ") is not used.");
			return;
		}

		let activeTab = this.eTabs.querySelector(".tab.active");
		if (activeTab) {
			activeTab.classList.remove("active");
		}
		let newTab = this.eTabs.querySelector('.tab[data-contentid="' + inContentId + '"]');
		if (newTab) {
			newTab.classList.add("active");
		}

		// console.log("Navigated to inContentId: " + inContentId);
	}

	create(inParentID) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inParentID, this.getHTMLTemplate());
		this.eTabs = this.element.querySelector(".tabs");
    }

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
    
<div class="navigation">
    <div class="tabs main-wrap"></div>
</div>


        `);
    }
}
