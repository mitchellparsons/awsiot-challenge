### Inspiration
I am interested in Habits lately. A good book on the topic is Power of Habit. There exists a fantastic platform Habitica (formerly known as HabitRPG and open source) to help gamify habit forming. Something that I feel is missing from Habitica is the real world elements. To bring Habitica out of virtual space I integrated it with AWS IoT platform to connect real world devices!

### What it does
With vanilla Habitica you can setup simple habits you are trying to curb or improve upon. Good habits like cleaning up your room each day, or bad habits like eating unhealthy snacks. My modified version of Habitica talks with AWS IoT platform. This new integration allows an end user of the modified Habitica to connect real world devices to both trigger habits or trigger the rewards or penalties from doing a habit or task. Imagination is the limit on the type of devices you can now connect to Habitica because of how easy AWS IoT is. For the demo I created a couple devices: a lockable candy dish to try and curb unhealthy snacking, a light bar to show users current health stats and provide optical feedback upon completion of tasks, and a simple script to lock a video game down making it unplayable until the user has completed enough tasks for the day.

### Lights - lights.js
This is a node.js script that can run on raspberry pi.
Please see the npm package rpi-ws281x-native on how to use RGB light strip with raspberry pi.  With an RGB light strip attached to the raspberry pi I can provide visual feedback on the health of the user, as well as when a task is rewarded or penalized.

### Candydish - candydish.js
This is a node.js script that can run on raspberry pi.
Pin 17 of the Raspberry Pi is connected to a candy dish sensor.  The pin is set to input mode (which is high impedance) so the candy dish can function normally - this is the state of ON.  When the pin 17 is set to "low" which is logical 0, or ground, then the sensor signal is short circuited to ground preventing any candy dishing - this is the state of OFF.
When the state of the candy dish is ON and the candy is dispenced then the script will signal Habitica to negatively trigger the task it is associated with thereby keeping track of how many times candy is dispensed.

### IoT Button - lambda.js
This is just a lambda script for node.js >4.x platform.  What it does is HTTP POST to habitica and update a set task I setup.  The button uses AWS IoT platform for invoking the lambda, but the lambda just does a plain old HTTP Post.

### PlayGame - playgame.js
This is a node.js script that will run on a Windows machine.  To try and curb my video game habits I replace the shortcut of the video game in question, with this script.  Everyone I select the shortcut this script runs, and if my Habitica user has enough health I am able to play my game, but if I do not have enough health then I am unable to play!
To make a shortcut run this script you can replace the shortcut target with the following
```%comspec% /c "node c:\<repolocation>\playgame.js"```

### config.json
config.json is hardcoded secrets!! Do not ever hard code secrets like this, but for the ease of this challenge I commited the file here.