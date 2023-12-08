/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class LoadUserdata {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="load-userdata"]'), this.getHTMLTemplate());
		this.eInputUserdataFolder = this.element.querySelector('.input-userdata-folder');
        /* State */

        /* Events */
        this.eInputUserdataFolder.addEventListener(
            "change",
            async (e) => {
                e.preventDefault();

                await app.userdata.setUserdataFromFileList(e.currentTarget.files);
            },
            false
        );

	}


    getHTMLTemplate() {
        const html = (inString) => { return inString };
        return (html`
 
<div class="load-userdata page container">
    <div class="load-userdata-section">
        <h1>Welcome to MeloNade</h1>
        <label>
            <span>Please select your MeloNade userdata folder:</span>
            <input class="input-userdata-folder" type="file" webkitdirectory="true"/>
        </label>
    </div>
</div>

        `);
    }
}