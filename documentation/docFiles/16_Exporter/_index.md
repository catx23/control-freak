## Usage

1.Run IDE action "Window/Export" and follow the instructions.

2.Run start.bat or start_linux.sh, located in the exported folder. The openend terminal will show at which URL the applications can 
   be opened.

3.At this point all enabled devices have been auto-started by enabling the driver flags 'Run Server Side'

4.Open your scene at http://localhost:5556/xideve/preview/workspace/my_scene_file_name.dhml

5.Or open your scene by browsing your workspace folder:  at http://localhost:5556/xideve/preview/workspace/



**Remarks**


## General

-The exporter is basically creating a copy of its own but without the desktop application.


## Data & Servers

-All ports can be adjusted in exported/server/[Platform=windows|linux|arm]/nxappmain/profile_device_server.json

-web-server : runs at 5556, so you open this url: http://localhost:5556/
 
-devices : all tagged with "Run Server-Side". The device server tries connecting/re-connecting every 3 secs
 
-drivers : no modification
 
-device-server: runs at 9997
 
-database-server: runs at 27018 (Mongo)
 
-mqtt-server: 1884 (Mosca)

