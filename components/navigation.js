/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class Navigation {
	constructor() {
		this.element = null;
		this.eTabWrap = null;
		this.ePanels = {};
		this.eTabs = {};
		this.activePanelId = null;
	}

	create(inScopeElement) {
		/* Elements */
		if (inScopeElement == null) { 
			// Allow this, we don't need the tabs to navigate.
			// Navigation can be set up to be done without user interaction.
			return;
		}
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="navigation"]'), this.getHTMLTemplate());
		this.eTabWrap = this.element.querySelector(".tab-wrap");
    }

	prepareRemoval() {
        this.element.remove();
		console.log("Prepared removal of self");
    }

	unregisterNavigation(inId) {
		if (inId == null || !this.ePanels[inId]) {
			// Not registered.
			return;
		}

		if (inId == this.activePanelId) {
			this.navigateTo(null);
		}

		let tab = this.eTabs[inId];
		if (tab) {
			tab.remove();
		}

		delete this.ePanels[inId];
		delete this.eTabs[inId];

		console.log("Unregistered navigation for: " + inId);
	}

	registerNavigation(inId, inTabTitle, inTabOrderIndex, inElement) {
		// Clean up any present registration first.
		this.unregisterNavigation(inId);

		this.ePanels[inId] = inElement;

		if (inTabTitle != null) {
			if (this.eTabWrap == null) {
				console.error("Navigation has been set up without html, so we can't add tabs.");
				return;
			}

			let newTab = UIUtils.createElement('<span class="tab button button-style-1" style="order:' + inTabOrderIndex + ';" data-contentid="' + inId + '">' + inTabTitle + '</span>');
			this.eTabWrap.appendChild(newTab);
	
			newTab.addEventListener(
				"click",
				(e) => {
					this.navigateTo(e.currentTarget.dataset.contentid);
				}
			);

			// Store a reference to the tab.
			this.eTabs[inId] = newTab;
		}

		console.log("Registered navigation at ID: " + inId);
	}

	navigateTo(inId) {
		console.log("Navigation to: " + inId);

		// Hide currently active panel and update tab class.
		const oldId = this.activePanelId;
		if (this.activePanelId != null) {
			let activePanel = this.ePanels[this.activePanelId];
			if (activePanel) {
				UIUtils.updateVisibility(activePanel, false);

				let activeTab = this.eTabs[this.activePanelId];
				if (activeTab) {
					activeTab.classList.remove("active");
				}
			}
		}

		// No panel and no tab is active at this point.
		this.activePanelId = null;

		// Show new panel and update tab class.
		if (inId != null) {
			let newPanel = this.ePanels[inId];
			if (newPanel) {
				UIUtils.updateVisibility(newPanel, true);
				this.activePanelId = inId;

				let newTab = this.eTabs[this.activePanelId];
				if (newTab) {
					newTab.classList.add("active");
				}
			}
			else {
				console.error("Navigation error, this contentId (" + inId + ") is not used.");
				return;
			}
		}

		let navigatedEvent = new Event('navigation-navigated', { bubbles: false });
		navigatedEvent.navigationObject = this;
		navigatedEvent.navigatedFrom = oldId;
		navigatedEvent.navigatedTo = this.activePanelId;
		// console.log(navigatedEvent);
		window.dispatchEvent(navigatedEvent);
	}

    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
    
<div class="navigation">
    <div class="tab-wrap"></div>
</div>


        `);
    }
}
