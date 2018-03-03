require('dotenv').config()
var service = require('./src/service')();

var server = service.listen(process.env.App_Port, process.env.App_Host, function () {
    var address = server.address().address + ":" + server.address().port;
    console.log("App started on on %s", address)
});

module.exports = server;