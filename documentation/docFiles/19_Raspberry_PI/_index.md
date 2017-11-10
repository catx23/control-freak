### Layouts

[PI-3](https://pinout.xyz/pinout/pin11_gpio17)
[PI-3](http://www.myelectronicslab.com/tutorial/raspberry-pi-3-gpio-model-b-block-pinout/)


### Examples

tbc

### Built-in GPIO driver

Control-Freak has a built-in GPIO driver which is using a [Node-JS library](https://github.com/fivdi/pigpio).
The module however needs some extra installation:

    cd /home/pi/Control-Freak/drivers/Raspberry
    #or for the web-distribution
    cd /var/www/html/control-creak/drivers/Raspberry
    npm install

If you run the web distribution, be warned that the GPIO needs root access to function.
This is because of the access to /dev/mem. See issue [here](https://github.com/fivdi/pigpio/issues/2).







