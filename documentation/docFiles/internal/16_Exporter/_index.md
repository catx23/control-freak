## Usage



### Windows

- Drag your user folder (MyUser\Documents\Control-Freak) onto Control-Freak\export.bat 

### Linux/OSX

    run ./Control-Freak/export.sh --user=MyUser/Documents/Control-Freak

---------------------------------------------------------------------------------------


1. wait til terminal closes (may last up to 5 minutes)

2. your exported app is located at /exported (will be overridden the next time)

3. run /exported/start.bat (linux/osx: start.sh)

4. run /exported/stop_servers.bat (linux/osx: stop_servers.sh) to shutdown the app (important if you export the second time) on a non IDE computer, otherwise press CTRL-C in the existing running server terminal window



## Data & Servers

 - web-server : runs at 8889, so you open this url: http://localhost:8889/
 
 - your workspace, located then at http://localhost:8889/user/workspace. You must open the files with *.html extension, not *.dhtml
 
 - devices : all tagged with "Run Server-Side". The device server tries connecting/re-connecting every 3 secs
 
 - drivers : no modification
 
 - device-server: runs at 9997
 
 - database-server: runs at 27018 (Mongo)
 
 - mqtt-server: 1884 (Mosca)

## More options:

The export script (export.bat or export.sh) sets only default options. It basically goes in the server directory and runs:
 
    ./server noob --client="../../Code/client/" --file=export.js --system="../../data" --user="$1" --target="../../exported" --dist="../../server/" "$@"

You see that it is using the first argument to specific the source location of your default user workspace (Documents\Control-Freak).

Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -f, --file <path>    run a file
    -r, --root <path>    root path to Control-Freak
    -u, --user <path>    user directory
    -t, --target <path>  target directory
    -s, --system <name>  path to system scope location
    -d, --dist <path>    path to the pre-compiled NodeJS servers
    --windows <boolean>  true/false to export windows NodeJS server
    --osx <boolean>      true/false to export OSX NodeJS server
    --linux32 <boolean>  true/false to export Linux-32 Bit NodeJS server
    --linux64 <boolean>  true/false to export Linux-64 NodeJS server
    --arm <boolean>      true/false to export ARM-v7 NodeJS server
    --client <string>    path to client root
    
The more interesting option is --target. It specifies where to export your application.

