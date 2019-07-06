const fs = require("fs");
const options = {};
if (fs.existsSync('./certs')) {
    if (fs.existsSync("./certs/cert.key") && fs.existsSync("./certs/cert.pem")) {
        options.key = fs.readFileSync('./certs/cert.key');
        optioms.cert = fs.readFileSync('./certs/cert.pem');
    }
}
function isObjectEmpty(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object
}
module.exports = { options, isObjectEmpty };
