/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class Userdata {
    constructor() {
        this.data = null;
    }

    async setUserdataFromFileList(inFileList) {
        // Clear the current data.
        this.data = null;

        // When uploading the userdata folder, we can run tests if required folder names / files are present. Some folder names are specified by the user.
        // If this data doesn't fully pass validation, we should abort.
        // console.log(inFileList);
        if (!inFileList || inFileList.length < 1) {
            return;
        }

        let newData = {};
        newData.songs = {};
        newData.profiles = null;
        newData.activeProfile = null;

        // Loop through all files and rebuild userdata.
        for (let i = 0; i < inFileList.length; i++) {
            const fileX = inFileList[i];
            const path = fileX.webkitRelativePath;
            const pathStructure = path.split("/");
            // console.log(pathStructure);

            if (pathStructure.length < 1) {
                console.error("invalid path");
                return;
            }

            // Attempt to parse as song.
            if (pathStructure[1] === "songs") {
                if (pathStructure.length < 4) {
                    // The path is expected to be built of 4 components ("*data folder*/songs/*song title*/*song files*"). 
                    console.error("The structure of a song path is expected to be (*data folder*/songs/*song title*/*song files*): " + path);
                    return;
                } 

                // Song path is valid. Now build the object.
                const songTitle = pathStructure[2];
                if (!newData.songs[songTitle]) {
                    newData.songs[songTitle] = {};
                    newData.songs[songTitle].title = songTitle;
                }

                const fileNameX = pathStructure[3]
                switch(fileNameX) {
                    case ("album.jpg"):
                        newData.songs[songTitle].albumImage = fileX;
                    break;
                    case ("audio.ogg"):
                        newData.songs[songTitle].audio = fileX;
                    break;
                    case ("midi.mid"):
                        newData.songs[songTitle].midi = fileX;
                    break;
                    default:
                        console.warn("This file lives in the song directory but will not be parsed, as it is not expected to be here: " + path);
                }
            }

            // Attempt to parse as profiles file.
            else if (pathStructure[1] == "profiles") {
                if (pathStructure.length != 3 || pathStructure[2] != "melonade-profiles.json") {
                    console.error("The structure of a path to the profiles file is expected to be (*data folder*/profiles/melonade-profiles.json): " + path);
                    return;
                } 

                // Found the profiles file.
                newData.profiles = JSON.parse(await fileX.text());
                console.log("Got profile data:");
                console.log(newData.profiles);

                // There is no profile manager yet, but we can use the default provided.
                newData.activeProfile = newData.profiles[0];
            }
        }

        // All files were attempted to parse. On any failure there we should not reach this point but return null.
        // Here we can do final validations.

        for (const [key, value] of Object.entries(newData.songs)) {
            // For basic functionality, we need midi data and audio to sync to.
            if (!value.audio || !value.midi) {
                console.error("This song is missing required files: " + key);
                return;
            }
        }

        if (newData.profiles == null) {
            console.error("Failed to retrieve profiles from file.");
            return;
        }

        if (!newData.activeProfile) {
            console.error("Failed to retrieve an active profile.");
            return;
        }

        // Valid, so overwrite the actual data property.
        this.data = newData;
        const updatedDataEvent = new Event('userdata-updated-data', { bubbles: false });
        window.dispatchEvent(updatedDataEvent);
    }

    isValid() {
        // If we set this.data to anything else than null, it passed validation there.
        return this.data != null;
    }
}