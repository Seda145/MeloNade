/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class UIUtils {
	static updateVisibility(inElem, bInShow) {
		if (!inElem) {
			console.log("UIUtils.updateVisibility: invalid inElem.");
			return;
		}
		if (bInShow) {
			inElem.classList.remove("hide");
		}
		else {
			inElem.classList.add("hide");
		}
	}

	static createElement(inHTML) {
		// Helper method to create an element exactly as the html argument specifies, without leaving a wrapping parent container created by "createElement".
		let newElem = document.createElement("div");	
        newElem.innerHTML = inHTML;
        newElem = newElem.firstElementChild;
		return newElem;		
	}

	static setInnerHTML(inParentElement, inHTML) {
		// Helper method to create and append an element exactly as the html argument specifies, without leaving a wrapping parent container created by "createElement".
		let newElem = UIUtils.createElement(inHTML);
        inParentElement.appendChild(newElem);
		return newElem;
	}
}

