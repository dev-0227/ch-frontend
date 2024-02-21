const port = process.env.PORT || 8080;

const https = require('http');
const app = require('./app');
var fs = require('fs');

/*var https_options = {
    key: fs.readFileSync("./client/keys/domain.key"),
    cert: fs.readFileSync("./client/keys/SINERGIAHEALTH.COM.crt")
  };*/

const server = https.createServer(app);

server.listen(port, () => {
  console.log('Start to listening port:' + port);
});