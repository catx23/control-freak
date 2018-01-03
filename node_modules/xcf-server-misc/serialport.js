var serialport = null;
try {
    serialport = require('serialport');
}catch(e){
    console.error('error loading serial port');
}
module.exports = serialport;