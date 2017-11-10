# Connecting to Raspberry-PI

## Links - Installation

1. [Installation of Node-JS & Johnny - Five](http://www.webondevices.com/install-node-js-on-a-raspberry-pi-and-run-javascript)

2. [Installation of Raspberrian](https://www.raspberrypi.org/downloads/raspbian/)

3. [Johhny-Five & Rasp-IO](http://johnny-five.io/examples/raspi-io/)

### Installation - Johnny - Five (on the PI)

    git clone git://github.com/rwaldron/johnny-five.git
    cd johnny-five
    sudo npm install --unsafe-perm
    sudo npm install serial port --unsafe-perm
    sudo npm install raspi-io —unsafe-perm

Now test:

    cd johnny-five
    node eg/raspi-io.js
    


