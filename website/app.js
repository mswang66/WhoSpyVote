const path = require('path');
const express = require('express');
var proxy = require('http-proxy-middleware');

let app = express();

var wsProxy = proxy('/mwv0', {target:'http://localhost:6666', ws:true});
app.use(wsProxy);
// wsProxy proxy('/', {target:'http://localhost:6666', ws:true});


app.use('/', express.static(path.resolve('./')));
// app.use('/index.html', express.static(path.resolve('./index.html')));
// app.use('/login.html', express.static(path.resolve('./login.html')));
// app.use('/js/', express.static(path.resolve('./js/')));
// app.use('/bootstrap-3.3.5/', express.static(path.resolve('./bootstrap-3.3.5/')));

app.listen(3000);



