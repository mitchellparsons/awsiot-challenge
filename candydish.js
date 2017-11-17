var awsIot = require("aws-iot-device-sdk");
var Gpio = require("onoff").Gpio;
var config = require("./config.json");
var http = require("http");

var habiticaUserId = config.userId;
var clientId = "client12345candyDish";

var thingShadows = awsIot.thingShadow({
  privateKey: new Buffer(config.privateKey),
  clientCert: new Buffer(config.clientCertificate),
  caCert: new Buffer(config.rootCA),
  clientId: clientId,
  host: config.endpoint
});

// var pin17;
var pin17 = new Gpio(17, 'in', 'none');

thingShadows.on("connect", function () {
  console.log("connected to " + config.endpoint);
  thingShadows.register(`habitica_user_${config.userId}`, {}, function () {
    console.log("listening for updates from thing " + config.userId);
  });
});

thingShadows.on("delta", function(thingName, stat) {
  updateHealth(stat.state.hp);
});

getUserHealth(updateHealth);

function updateHealth(health) {
  console.log("my hp is" + health)
  if (health >= 40) {
    console.log("turning on candyDish");
    pin17.unexport();
    pin17 = new Gpio(17, "in", "falling")
    pin17.watch(dispensingDebouncer)
  } else {
    pin17.unexport();
    console.log("turning off candyDish");
    pin17 = new Gpio(17, "low");
  }
}

var dispensingDebouncer = (function () {
  var timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(dispensed, 200);
  }
})()

function dispensed() {
  console.log("dispensing candy");
  // notify habitica that I ate candy. worth it.

  var post_req = http.request({
    host: config.habiticaHost,
    port: '80',
    path: `/api/v3/tasks/${config.tasks.eatCandy}/score/down`,
    method: 'POST',
    headers: {
      'Content-Length': 0,
      'x-api-user': config.userId,
      'x-api-key': config.apiToken
    }
  });
  post_req.write("");
  post_req.end();
}

function getUserHealth(callback) {
  var post_req = http.request({
    host: config.habiticaHost,
    port: '80',
    path: `/api/v3/user`,
    method: 'GET',
    headers: {
      'x-api-user': config.userId,
      'x-api-key': config.apiToken
    }
  }, function (res) {
    var body = "";
    res.on("data", function (data) {
      body += data;
    });
    res.on("end", function() {
      body = JSON.parse(body);
      callback(body.data.stats.hp);
    });
  });
  post_req.end();
}
