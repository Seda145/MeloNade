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

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/7d7fe1c0-4d71-4bd7-b512-decbef62c942)
![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/b14dfbe8-4a86-4c95-94e3-c18e7df3f935)

---

3.  You are now on the configuration page. You can configure your experience and save your configuration + song progress here.
   
![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/517a2d75-8f7c-4477-ae92-632abda84cb6)

---

4. Hit the play button and select a song on the song list. The listed songs match your current configuration, such as choice of instrument. The matching midi track containing this information should automatically be detected.

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/7329294d-ee3b-4b6a-9523-5322ecfab82e)

---

5. Connect your instrument if you haven't yet. The common way to connect your music instrument is through the Line-In port on your pc. This port is similar to the microphone port with less noise and a better signal tolerance. If the signal from your instrument is not loud enough you can use a pre-amp pedal between your istrument and the Line-In port. I personally use a "tc electronic Spark Booster" pedal to boost the signal, which greatly improves how well your accuracy is detected by this app. Ensure that the Line-In input level is set high enough. A low or bad input signal can not be processed.

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/15d409bf-33df-444f-94ba-f9138dd46356)

![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/10a45509-96c2-4141-bd04-9fb5d5b27c95)

---

6. Give permission for access to your microphone, so your connected music instrument will be detected. 
   
![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/a56f15f4-3a7d-43a3-940c-196532e02a71)

---

7. The music will play, Notes are automatically generated on a fretboard for your selected tuning. You can play at the correct timing (midi), which will increase or decrease your score.
   
![afbeelding](https://github.com/Seda145/MeloNade/assets/30213433/1ee7aa41-897a-45d8-a1db-11d4215e75ad)


---

Tips and Todos:

1. Use this app responsibly. I do not support piracy, so no songs are included except for the example I made.
2. ![Read the roadmap](https://github.com/Seda145/MeloNade/wiki/Roadmap) to see what still needs to be done.
3. Bass guitar is the currently implemented instrument. 
4. Use a microphone device to play along, or use the "stereo mix" (realtek driver) to route system audio as input. The latter is useful when the audio frequencies match the midi and you want to test the system.
5. If you are a Rocksmith player, you should know cdlc (psarc) can fully be parsed to this app using Rocksmith EOF (Editor On Fire) and RocksmithToolkit. I am still looking for a way to preserve audio offsets and instrument techniques.
