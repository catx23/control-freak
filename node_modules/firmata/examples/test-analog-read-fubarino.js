var Board = require("../");
var pin = Number(process.argv[2] || 0);


Board.requestPort(function(error, port) {
  if (error) {
    console.log(error);
    return;
  }

  var board = new Board(port.comName);

  board.on("ready", function() {
    console.log("  ✔ ready");
console.log(pin);
    this.pinMode(pin, 2);
    this.analogRead(pin, function(value) {
      console.log(`analogRead: ${pin} ${value}`);
    });

    board.on("string", function(data) {
      console.log(`string: ${data}`);
    });
  });

});
