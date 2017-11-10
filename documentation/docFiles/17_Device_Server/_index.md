## General

### IDE Mode or Deployed/Exported 

Depending on the platform, the device server is located in 

    /server/windows (x64)
    /server/linux_32 
    /server/linux_64
    /server/arm (x32)
    /server/osx (x64)

## Command line arguments

### General 

When ever a command line argument needs to be passed, it is necessary 
to add a dummy command:

    ./server dummy option 

This are the parsed options: 
    
    -h, --help              output usage information
    -V, --version           output the version number
    -i, --info              return service profile
    -f, --file <path>       run a file
    -u, --user <path>       user directory
    --start <boolean>       start devices
    --serverSide <boolean>  make devices server side
    -s, --system <name>     path to system scope location
    -j, --jhelp             output options as json


### Option "info"

This option is for internal usage only and returns a JSON structure: 

    #server dummy --info

returns

    {"host":"http://0.0.0.0","port":9998}


### Option "file"

This option is for internal usage only and enables to run a Node JS source file: 

    #server dummy --file=export.js

- Since the "server" is a pre-compiled Node.js binary with some addons and an own command-parser, its necessary to specify 
a file to be executed this way.


### Option "user"

This option will specify the location of the user workspace. This location is only required for the exporter.
Also, this option is set by default by the IDE to the user's "Documents Folder/Control-Freak"

- This option accepts relative paths to the server executable.


### Option "system"

This option will specify the location of the system scope and defaults to the IDE's /data/system location.

- This option accepts relative paths to the server executable.

### Option "serverSide"

This option marks enabled devices as server-side and is used by exported apps.

<hr/>

## Configuration (IDE/Exported)

There is a configuration file located in the server's main-directory: 

    server/nxappmain/profile_device_server.json

In the file certain settings are specified: 

- Port/Host of the device server it self

- Port/Host of the Mongo-Database

- Port/Host of the MQTT server

- Path to the system scope





