/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class LoadUserdata {
	create(inScopeElement) {
		/* Elements */
		this.element = UIUtils.setInnerHTML(inScopeElement.querySelector('[data-component="load-userdata"]'), this.getHTMLTemplate());
        this.eWrapUploadUserdata = this.element.querySelector('[data-wrap="upload-userdata"]');
		this.eInputUserdataFolder = this.eWrapUploadUserdata.querySelector('.input-userdata-folder');
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
 
<div class="load-userdata main-wrap">
    <div class="row">
        <div class="col-12">
            <fieldset data-wrap="upload-userdata" class="fieldstyle">
                <legend>Upload MeloNade userdata folder</legend>

                <label>
                    <span>Upload MeloNade userdata folder</span>
                    <input class="input-userdata-folder" type="file" webkitdirectory="true"/>
                </label>
            </fieldset>
        </div>
    </div>
</div>

        `);
    }
}