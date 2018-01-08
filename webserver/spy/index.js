/*Copyright 2017 [name of copyright owner]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
'use strict';

var app = require('connect')();
var cookieParser = require('cookie-parser');
var http = require('http');
var path = require('path');

var wsMessageController = require('./wsMessageController');
var serverPort = 6666;
var server = null;

// app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO}));
// app.use(cookieParser());
// app.use(license.licenseAuth);
// app.use(login.checkSession);
//
// app.use('/mw/v1.0/regions',regions);
// app.use('/mw/v1.0/login',login.login);
// app.use('/mw/v1.0/logout',login.logout);
// app.use('/mw/v1.0/supportFabric', supportFabric);

// app.use("/w", function (req,res,next) {
//   res.statusCode = 200;
//   let data = {"supportFabric": constants.supportFabric};
//   res.end(JSON.stringify(data, null, 2));
//
// })
// Start the server
app.use(cookieParser());
server = http.createServer(app);
wsMessageController(server);
server.listen(serverPort, function () {
  // logger.debug('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
  console.log("xxxx")
});
process.on('uncaughtException', function(e) {
  console.log(e);
});
