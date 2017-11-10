var http = require('http');

var userId = "d2dc7294-74cf-43b5-bbe2-124b3fe9e468";
var token = "9c0e9bd7-94c1-41f0-b19d-28dba0be9ecd";
var taskId = "370588f4-b931-4677-a858-a7c0b044fb27";
var host = "34.212.252.169";

var path = `/api/v3/tasks/${taskId}/score/up`;

var post_options = {
  host: host,
  port: '80',
  path: path,
  method: 'POST',
  headers: {
      'Content-Length': "0",
      'x-api-user': userId,
      'x-api-key': token
  }
};
function run() {
  var post_req = http.request(post_options);
  post_req.write("");
  post_req.end();
}

module.exports.handler = run;