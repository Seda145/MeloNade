/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class Userdata {
    constructor() {
        this.data = null;
    }

    setUserdataFromFileList(inFileList) {
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

        // Loop through all files and rebuild userdata.
        for (let i = 0; i < inFileList.length; i++) {
            const fileX = inFileList[i];
            const path = fileX.webkitRelativePath;
            const pathStructure = path.split("/");
            // console.log(pathStructure);

            // Attempt to parse as song.
            if (pathStructure.length > 1 && pathStructure[1] === "songs") {
                if (pathStructure.length < 4) {
                    // The path is expected to be built of 4 components ("*data folder*/songs/*song name*/*song files*"). 
                    console.error("The structure of a song path is expected to be (*data folder*/songs/*song name*/*song files*): " + path);
                    return;
                } 

                // Song path is valid. Now build the object.
                const songName = pathStructure[2];
                if (!newData.songs[songName]) {
                    newData.songs[songName] = {};
                    newData.songs[songName].name = songName;
                }

                const fileNameX = pathStructure[3]
                switch(fileNameX) {
                    case ("album.jpg"):
                        newData.songs[songName].albumImage = fileX;
                    break;
                    case ("audio.ogg"):
                        newData.songs[songName].audio = fileX;
                    break;
                    case ("midi.mid"):
                        newData.songs[songName].midi = fileX;
                    break;
                    default:
                        console.warn("This file lives in the song directory but will not be parsed, as it is not expected to be here: " + path);
                }
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

        // Valid, so overwrite the actual data property.
        this.data = newData;
    }

    isValid() {
        // If we set this.data to anything else than null, it passed validation there.
        return this.data != null;
    }
}

