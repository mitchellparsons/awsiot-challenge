// To make a shortcut replace the shortcut target with the following
// %comspec% /c "node c:\<repolocation>\playgame.js"

var AWS = require("aws-sdk");
var config = require("./config.json");
var exec = require("child_process").exec;

// This assumes you have aws access_key and secret_key in environment variables
// or in the .aws credentials
var iotdata = new AWS.IotData({
  endpoint: "acp7yis5xraca.iot.us-west-2.amazonaws.com",
  region: "us-west-2"
});

var START_APP = "start steam://rungameid/730";
var thingName = `habitica_user_${config.userId}`;
iotdata.getThingShadow({thingName}, function (err, data) {
  if (err) console.log(err, err.stack);
  else {
    let health = JSON.parse(data.payload).state.desired.hp;
    console.log("I got health of " + health)
    if (health >= 50) {
      exec(START_APP);
    } else {
      console.log(`Your Health is too low at ${Math.floor(health)}! Please complete a task!`);
      console.log("Press any key to exit");
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', process.exit.bind(process, 0));
    }
  }
});