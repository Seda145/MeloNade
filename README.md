[[ Copyright Roy Wierer (Seda145) ]]
https://nl.linkedin.com/in/roy-wierer-68643a9b 


Using the application:

This is a work in progress, a very, very early version. Basic functionality is implemented but not perfected. It will be worked on over time. 

This browser application is a tool for musicians to analyze audio, microphone input and midi data for entertainment purposes.
You can play a music instrument through your microphone in realtime while music plays. The analyzer will attempt to track your playing accuracy.


Instructions:

---

1. Download all files of this app. If you get it as a zip file, unzip it somewhere, then open app.html in your web browser.

---

2. Select a "userdata" folder. This folder contains all your songs and your profile data. (an example userdata folder is provided).

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/52a2d2b4-4e9d-4660-a6fc-fe590e117a0b) >>>  ![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/b14dfbe8-4a86-4c95-94e3-c18e7df3f935)

---

3. Give permission for access to your microphone, so your connected music instrument will be detected. 
   
![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/4d03bded-1ceb-4d57-842a-25e4b9177855)

---

4.  You are now on the configuration page. You can configure your experience and save your configuration + song progress here.
   
![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/be7ee20a-f199-4593-8436-5e085ff69478)

---

5. Continue to the Song List and select a song. The listed songs come from your userdata folder and match your current configuration, such as choice of instrument. 

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/3c202f87-5842-4e3c-8045-99eeb6fd5edb)

---

6. Connect your instrument if you haven't yet. The common way to connect your music instrument is through the Line-In port on your pc. This port is similar to the microphone port with less noise and a better signal tolerance. If the signal from your instrument is not loud enough you can use a pre-amp pedal between your istrument and the Line-In port. I personally use a "tc electronic Spark Booster" pedal to boost the signal, which greatly improves how well your accuracy is detected by this app. Ensure that the Line-In input level is set high enough. A low or bad input signal can not be processed.

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/15d409bf-33df-444f-94ba-f9138dd46356)

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/10a45509-96c2-4141-bd04-9fb5d5b27c95)

---

7. There is a new page, the "Tones page". Here you can modify the input / output signal of your instrument through effect pedals. This is a new feature. Currently I have implemented a gain boost pedal.

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/c7cbb6c8-4b13-4366-b93e-1ad81b5f909d)

---

8. The music will play, Notes are automatically generated on a fretboard for your selected tuning. You can play at the correct timing (midi), which will increase or decrease your score.
There are currently two visualizers, a horizontal and a vertical one:

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/54b7751d-9674-47be-b3b6-1e4a1d77d3a3)

---

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/b22732d1-e363-47cd-bc36-8972c94b9c02)

---

Tips and Todos:

1. Use this app responsibly. I do not support piracy, so no songs are included except for the example I made.
2. ![Read the roadmap](https://github.com/Seda145/MeloNade/wiki/Roadmap) to see what still needs to be done.
3. Bass guitar is the currently implemented instrument. 
4. Use a microphone device to play along, or use the "stereo mix" (realtek driver) to route system audio as input. The latter is useful when the audio frequencies match the midi and you want to test the system.
5. If you are a Rocksmith player, you should know cdlc (psarc) can fully be parsed to this app using Rocksmith EOF (Editor On Fire) and RocksmithToolkit. I am still looking for a way to preserve audio offsets and instrument techniques.
