var awsIot = require("aws-iot-device-sdk");
var http   = require("http");
var config = require("./config.json");
var ws281x = require("rpi-ws281x-native");

var length = 39;
var lights = new Array(length).fill(0x00);
var offset = 27;
var offsetArray = new Array(offset).fill(0x00);

var colorsOffset = {
  red: 24,
  green: 16,
  blue: 8,
  white: 0
}
var max_health = 50;
var currentHealthLightsArray = new Array(length).fill(0x00);

ws281x.init(length * 4 / 3 + offset * 4 / 3, {
  gpioPin: 18
});

var thingShadows = awsIot.thingShadow({
  privateKey: new Buffer(config.privateKey),
  clientCert: new Buffer(config.clientCertificate),
  caCert: new Buffer(config.rootCA),
  clientId: "client12345Lights",
  host: config.endpoint
});

thingShadows.on("connect", function () {
  render(currentHealthLightsArray);
  thingShadows.subscribe("habitica_user/" + config.userId + "/#");
  thingShadows.register('habitica_user_' + config.userId);
});

thingShadows.on('delta', function (thingName, stateObject) {
  var user = stateObject.state;
  updateHealth(user.hp);
});

thingShadows.on("message", function (topic, payload) {
  var task = JSON.parse(payload.toString());
  if (task.direction === "up") {
    glow(colorsOffset.green, 0xaf);
  } else if (task.direction === "down") {
    glow(colorsOffset.red, 0xaf);
  }
});

getUserHealth(updateHealth);

function updateHealth(health) {
  if(health > max_health) health = max_health;
  var litAmount = Math.ceil(health / max_health * length);
  currentHealthLightsArray = (new Array(litAmount).fill(0xaf << colorsOffset.red))
    .concat(new Array(length - litAmount).fill(0x00));
  render(currentHealthLightsArray);
}

var glow = (function () {
  var timeout = 20;
  var max = 200;
  var count = 0;
  var iterations = 2;
  return function glow(color, intensity) {
    count++;
    var value = Math.abs(Math.floor(intensity * Math.sin(Math.PI * count / (max / iterations))));
    lights = new Array(length).fill(value << color || 0);
    render(lights);
    if (count <= max) {
      setTimeout(function () {
        glow(color, intensity)
      }, timeout);
    } else {
      count = 0;
      render(currentHealthLightsArray);
    }
  }
})();


function render(lights) {
  var arr = lights.concat(offsetArray);
  ws281x.render(new Uint32Array(convertRGBWtoRGBArray(arr)));
}

function convertRGBWtoRGBArray(data) {
  var newArr = [];
  while (data.length >= 3) {
    var one = data.pop();
    var two = data.pop();
    var three = data.pop();
    newArr.push(
      ((one & 0x00ff000000) >>> 8) +
      ((one & 0x00ff0000) >>> 8) +
      ((one & 0x00ff00) >>> 8)
    );
    newArr.push(
      (two & 0x00ff0000) +
      ((one & 0xff) << 8) +
      ((two & 0xff000000) >>> 24)
    );
    newArr.push(
      ((two & 0x000000ff) << 16) +
      (two & 0x0000ff00) +
      ((three & 0x00ff0000) >>> 16)
    );
    newArr.push(
      ((three & 0x0000ff00) << 8) +
      ((three & 0xff000000) >>> 16) +
      (three & 0x000000ff)
    );
  }
  return newArr;
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
