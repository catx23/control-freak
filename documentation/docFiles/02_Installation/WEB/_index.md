## General

This distribution allows you to run Control-Freak on your own web server.
 
Please notice that you need these standard server programs: **PHP**, **Apache** or **NGINX**, **NodeJS** and the **Mongo** database server.

Apart from the web-server components. Its necessary to install the Control-Freak NodeJS modules which also 
have certain **native dependencies**. Whilst on Linux and OSX its not a problem to install these, you may have problems to 
install them on Windows. However, on Windows you only need Visual-Studio installed to compile the native extensions.


### Requirements

Please find [here](./WEB/Requirements) more information.


### **Installation via zip [download here.](http://pearls-media.com/control-freak/?ddownload=3807)**

Uncompress the zip file to location like /Control-Freak.


### **Installer Script**

Run this here in your web server directory: 

    wget -O - https://raw.githubusercontent.com/net-commander/web-dist/master/installFromWeb.sh | bash

What it does ([see here script source](https://raw.githubusercontent.com/net-commander/web-dist/master/installFromWeb.sh)):

1. create a sub-directory "control-freak"
2. download latest zip ball und unzip in "control-freak"
3. Install system dependencies
4. Install Nodejs dependencies

You can now:

    cd control-freak
    sh start_linux.sh

Then, open in your browser http://localhost/control-freak

Your user workspace will be in ./control-freak/user



### **Download via git (Recommended since you can receive updates with this method)**

1.In a new console inside your 'htdocs' directory:

    git clone https://github.com/net-commander/web-dist.git ./Control-Freak


### Post-Installation, install NodeJS dependencies: 

**Attention**: Make sure you have npm version > 3 installed. If not:

    sudo npm install -g npm@next


Inside "./Control-Freak/server/nodejs", type the following in the terminal: 
  
    npm install

Attention **RaspberryPI** users! You may use:

    npm install --unsafe-perm

    
Attention **Linux**/**RaspberryPI** users:

Please install required packages before npm install: 

    sudo apt-get install build-essential
    sudo apt-get install gawk
    sudo apt-get install libzmq3-dev

Optional, needed by the audio players (raw or VLC)
    sudo apt-get install libasound2-dev 
    sudo apt-get install libvlc-dev

**Windows** users:

If you're on x67 but using a x32 NodeJS version, please run in server\nodejs:

    install32.bat


Attention **OSX** users:

For using the VLC driver, you need to install libvlc: 

    port install libVLC


<hr/>

### Start 

1.Start if not already the Mongo-DB server. 
    
    - Windows users: there is a start_mongo.bat!
    - OSX make sure you installed mongodb, then run the mongod server : # mongod


2.Start the device server:

Windows: 

    start.bat

Linux:

    sh start_linux.sh
    
OSX:
    
    start_osx.command


Got to the location of your web server, eg: http://localhost/Control-Freak. Now you're ready to go!
 

### Important

- Use latest Chrome or Chromium for the IDE!

- You may append the IDE url with &userDirectory=/home/pi/Documents/Control-Freak ! Otherwise your changes 
  will be colliding with git updates. If you're on Windows, make sure you [escape](www.freeformatter.com/html-escape.html#ad-output) the path to your 
  Control-Freak user directory.



### Tips

You can make the device server running permanently:
 
    sudo npm install -g forever
    cd /htdocs/control-freak/server/nodejs
    forever start start.js
    