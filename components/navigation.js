/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class Navigation {
	constructor() {
		this.element = null;
		this.eTabs = null;
		this.panels = {};
		this.tabs = {};
		this.activePanelId = null;
	}

	unregisterNavigation(inId) {
		if (inId == null || !this.panels[inId]) {
			// Not registered.
			return;
		}

		if (inId == this.activePanelId) {
			this.navigateTo(null);
		}

		let tab = this.tabs[inId];
		if (tab) {
			tab.remove();
		}

		delete this.panels[inId];
		delete this.tabs[inId];

		console.log("Unregistered navigation for: " + inId);
	}

	registerNavigation(inId, inTabTitle, inTabOrderIndex, inElement) {
		// Clean up any present registration first.
		this.unregisterNavigation(inId);

		this.panels[inId] = inElement;

		if (inTabTitle != null) {
			if (this.eTabs == null) {
				console.error("Navigation has been set up without html, so we can't add tabs.");
				return;
			}

			let newTab = UIUtils.createElement('<span class="tab" style="order:' + inTabOrderIndex + ';" data-contentid="' + inId + '">' + inTabTitle + '</span>');
			this.eTabs.appendChild(newTab);
	
			newTab.addEventListener(
				"click",
				(e) => {
					this.navigateTo(e.currentTarget.dataset.contentid);
				}
			);

			// Store a reference to the tab.
			this.tabs[inId] = newTab;
		}

		console.log("Registered navigation at ID: " + inId);
	}

	navigateTo(inId) {
		console.log("Navigation to: " + inId);

		// Hide currently active panel and update tab class.
		if (this.activePanelId != null) {
			let activePanel = this.panels[this.activePanelId];
			if (activePanel) {
				UIUtils.updateVisibility(activePanel, false);

				let activeTab = this.tabs[this.activePanelId];
				if (activeTab) {
					activeTab.classList.remove("active");
				}
			}
		}

		// No panel and no tab is active at this point.
		this.activePanelId = null;

		// Show new panel and update tab class.
		if (inId != null) {
			let newPanel = this.panels[inId];
			if (newPanel) {
				UIUtils.updateVisibility(newPanel, true);
				this.activePanelId = inId;

				let newTab = this.tabs[this.activePanelId];
				if (newTab) {
					newTab.classList.add("active");
				}
			}
			else {
				console.error("Navigation error, this contentId (" + inId + ") is not used.");
				return;
			}
		}
	}

	create(inScopeElement) {
		/* Elements */
		if (inScopeElement == null) { 
			// Allow this, we don't need the tabs to navigate.
			// Navigation can be set up to be done without user interaction.
			return;
		}
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="navigation"]'), this.getHTMLTemplate());
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
