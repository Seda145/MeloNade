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

	static setInnerHTML(inParentID, inHTML) {
		// Helper method to create and append an element exactly as the html argument specifies, without leaving a wrapping parent container created by "createElement".
        let parentElem = document.getElementById(inParentID);
		let newElem = UIUtils.createElement(inHTML);
        parentElem.appendChild(newElem);
		return newElem;
	}
}

