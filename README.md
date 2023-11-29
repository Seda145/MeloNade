[[ Copyright Roy Wierer (Seda145) ]]
https://nl.linkedin.com/in/roy-wierer-68643a9b 


Using the application:

This is a work in progress, a very, very early version. Basic functionality is implemented but not perfected. It will be worked on over time. 

This browser application is a tool for musicians to analyze audio, microphone input and midi data for entertainment purposes.
You can play a music instrument through your microphone in realtime while music plays. The analyzer will attempt to track your playing accuracy.


Instructions:

1. Open app.html in your web browser.

2. Select a "userdata" folder. This folder contains data for MeloNade including your songs. (an example userdata folder is provided).

![2](https://github.com/Seda145/MeloNade/assets/30213433/b14dfbe8-4a86-4c95-94e3-c18e7df3f935)
![1](https://github.com/Seda145/MeloNade/assets/30213433/f7a77ea3-dcd5-4405-950e-ed125934f9b9)

3. Submit the data on the configuration page and select a song on the now available song list.
 
![3](https://github.com/Seda145/MeloNade/assets/30213433/dedcf49f-f927-44d0-b883-be22c4bf622b)

4. Give permission for access to your microphone. The "microphone" can be a connected music instrument, or if you wish use the windows "stereo mix" device to use system audio output as input data.
   
![4](https://github.com/Seda145/MeloNade/assets/30213433/a56f15f4-3a7d-43a3-940c-196532e02a71)

5. The music will play, Notes are automatically generated on a fretboard for your selected tuning. You can play at the correct timing (midi), which will increase or decrease your score.
   
![5](https://github.com/Seda145/MeloNade/assets/30213433/9f4d8eef-2423-4a86-a014-c45d67d60d50)


Tips and Todos:

1. The first track of a midi file is read and synchronized to an audio file. 
2. Chord sound detection has not yet been implemented. 
3. Bass guitar visualizer is implemented.
4. Use a microphone device to play along, or use the "stereo mix" (realtek driver) to route system audio as input.
5. If your midi [causes the script to timeout](https://github.com/Tonejs/Midi/issues/187), attempt to recreate it (by exporting) through Reaper.
