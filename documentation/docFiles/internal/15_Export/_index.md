# Outputs


## Web


**Server - Modules**
 
 The following servers will be exported:
 
 1. NGINX
 2. Device - Server (custom & pre-compiled Node - JS binary)
 3. MONGO - Database Server (binary)

**Web Assets / Scene**

 The exporter will deploy all files from the user's workspace. 
 The index.html will be the start scene as it is standard.
  

------------------------------------------------------------------------

# Export Options

**Server - Modules**


  1. NGINX
      - Ports
      - Use System's Nginx
  2. Device - Server (custom & pre-compiled Node - JS binary)
      - Ports
      - Use system's Node.js binary
      - Host
  3. MONGO - Database Server (binary)
      - Ports
      - User system's Mongo server
      - Mongo options: Host/Credentials


**Platforms**

  1. Windows
  2. Linux
  3. Mac-OSX

The export will create a user chosen folder "myapp" which contains all platforms 
 


------------------------------------------------------------------------

# Implementation

The exporters is available as global action : "File/Export App"

# Files & Folders

At the root of the exported app, there is:

- /data (as in IDE, this the system's data scope)
- /mongo (all Mongo - database binaries, for all platforms: osx/linux/windows)
- /nginx (all NGINX - web-server binaries, for all platforms: osx/linux/windows)
- /server (the device server binaries)
- /server/nodejs_linux (Linux version)
- /server/nodejs_windows (Windows version)
- /server/nodejs_osx (Mac-OSX version)
- /server/nodejs_arm (linux version)



## Todos:

1. prepare server-templates

2. figure out how to share dojo based node-modules running in electron
 
3. 



