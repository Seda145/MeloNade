[[ Copyright Roy Wierer (Seda145) ]]
https://nl.linkedin.com/in/roy-wierer-68643a9b 


Using the application:

This is a work in progress, a very, very early version. Basic functionality is implemented but not perfected. It will be worked on over time. 

This browser application is a tool for musicians to analyze audio, microphone input and midi data for entertainment purposes.
You can play a music instrument through your microphone in realtime while music plays. The analyzer will attempt to track your playing accuracy.


Instructions:

1. Open app.html in your web browser.
2. Select a folder using MeloNade userdata. This folder contains song data (an example userdata folder is provided).
3. Submit the data on the configuration page and select a song on the now available song list.
4. Give permission for access to your microphone. The "microphone" can be a connected music instrument, or if you wish use the windows "stereo mix" device to use system audio output as input data.
5. The music will play, Notes are automatically generated on a fretboard for your selected tuning. You can play at the correct timing (midi), which will increase or decrease your score.


Configuration (developer):

![configuration](https://github.com/Seda145/MeloNade/assets/30213433/bebc5cbd-76e3-48e4-bf61-67ea1165bae9)


Processing:

![Processing](https://github.com/Seda145/MeloNade/assets/30213433/14d9f841-241a-4ed6-b50d-d16acc660441)


Tips and Todos:

1. The first track of a midi file is read and synchronized to an audio file. 
2. Chord sound detection has not yet been implemented. 
3. Bass guitar visualizer is implemented.
4. Use a microphone device to play along, or use the "stereo mix" (realtek driver) to route system audio as input.