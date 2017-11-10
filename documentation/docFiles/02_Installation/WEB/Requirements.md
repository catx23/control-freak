## Requirements

**Windows**: please note: you can simply install ["xampp"](https://www.apachefriends.org/download.html) to get Apache & PHP 

### [Mongo-DB](https://www.mongodb.com/download-center)

Any version will do. 

Windows users: Even after installing Mongo-DB, the server won't be started automatically. There is a file "start_mongo.bat" to overcome this.

### PHP

PHP Version 5.4+

<hr/>

#### PHP Extensions

-MCrypt

-File-Info (Optional)

-Curl (Optional)

Linux users: Install missing PHP extensions: 

    sudo apt-get install php5-mcrypt
    sudo apt-get install php5-curl
    

<hr/>

#### PHP Settings

-Needs shell access

### Web-Server

-NGINX, Apache or Light-HTTP with PHP extension

OSX/Windows: You can use ["xampp"].(https://www.apachefriends.org/download.html)

Linux: You may already have it installed but in case not:

    sudo apt-get install apache2
    sudo apt-get install libapache2-mod-php


<hr/>

### Node-JS

Supported: Node-JS - v4.4.x. Download and install from [here.](https://nodejs.org/en/download/)
 

<hr/>


### Updates

#### Zip installation

1.Close all windows of Control-Freak (stop_server.sh)

2.Re-download and uncompress the zip over your existing installation

<hr/>

#### Via git

1. Got to the location of Control-Freak.app 

2. In Finder, "Show Package Contents"

3. double click "update.command"






