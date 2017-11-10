**Control-Freak Components Overview**

<img src="Components/Overview-Components.png"/>

### Summary

##### Control Freak Components

 - The ***[IDE (Authoring Software)](Components/IDE)*** enables authoring of *Control-Applications* as well integrating of devices and third party services and plugins.
 - The ***Control Application*** represents the final interface to devices and is usually a one-page web-application, running in all modern browsers and devices.
 - The ***Control-Freak-Server*** is a *command line application*(or *background-service*) which connects devices or services with the *IDE* or *Control-Application*
 - ***Devices*** are any devices which can be controlled over network.
 - ***Adapters*** enable access to 3th party services, products and platforms. 


#### DeviceServer

<img src="Components/Overview-Device-Server.png"/>


##### Third-Party Software & Projects

 - The ***OpenHab*** adapter enables direct access to hundreds of devices types.
 - The ***MQTT*** adapter also enables access to the many services and devices
 - Finally, the ***Nodes-JS Package*** adapter enables access to any Node-JS package. Most new implementations can be found at [www.npmjs.com](www.npmjs.com)