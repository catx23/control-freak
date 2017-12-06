# IDE for IoT & friends

![Engine](https://camo.githubusercontent.com/7bae0b99443921f1525afffbff807f7f54be3ec0/687474703a2f2f696d672e736869656c64732e696f2f6e6f64652f762f6b6f612e737667)
![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)

![Screenshot](https://cloud.githubusercontent.com/assets/1205100/21761461/6e2544e8-d653-11e6-85b9-ef093bb941e3.jpg)

### Installation

#### Global 
    
    npm install -g control-freak

#### Local

    npm install control-freak

### From git

    git clone https://github.com/xblox/control-freak.git
    cd control-freak
    npm install


### Start

No matter its installed locally or globally, control-freak will create a user workspace at /home/user/.control-freak. 

#### Localally / Git

    cd ./node_modules/control-freak
    npm run start
or
    node ./node_modules/control-freak/bin/control-freak.js


#### Globally

    control-freak

To specifify your user directory : 

    control-freak --user="antother path"


Now open the url provided in the console, ie: 

    http://0.0.0.0:5555/app/xcf?userDirectory=%2Fusr%2Flocal%2Flib%2Fnode_modules%2Fcontrol-freak%2Fexample_workspace


**Notice** 

- the url http://0.0.0.0:5555 won't work on windows, please use http://127.0.0.1:5555 instead

<hr/>


### Example user workspace

There is a example workspace:

    control-freak --user="control-freak/example_workspace"

### Screenshots

[Here](https://github.com/xblox/control-freak/issues/1)

### How does that work ? 

First you connect your device, then you build "commands" for your device's functionality and as last you drag those commands on GUI elements like buttons.
As last step, you export the whole thing The IDE deploys your scripts to the OSX, Windows, Linux, Raspberry-PI, ARM-6+ or to your preferred web server.

See here for a more illustrative information [here.](http://pearls-media.com/control-freak/overview/)

Notice, you don't need to dig deep in this software. Since it supports SSH you can build some automation or interfaces in minutes by calling just certain scripts.

<hr/>

### So what is it good for? 

Its designed for rapid prototyping and authoring web-interfaces for your connected devices & services.

See more features [here.](http://pearls-media.com/control-freak/features/)

<hr/>

### FAQ

1. Can I freely edit my HTML application? Yes, its based on open standard and sources.

2. Can I add or use my own Node-JS code to build connectivity? Yes!

3. Can I use my own source code editors? Yes! All file changes will properly update the IDE.  

<hr/>

### Pre-Compiled IDE & Server

Here links to all-in-one bundles. It includes the server (MongoDB, PHP, NodeJS) and the desktop application (custom "Chromium app", except the web server version).

|       **Platform**         | Linux - 32 Bit  | Linux - 64 Bit | OSX - 11 64 Bit | Windows - 64 Bit | Web-Server |
|:--------------:|:--------------:|:--------------:|:---------------:|:----------------:|:-----------------:|
|     Repo       |   [Github](https://github.com/net-commander/linux-dist_64)   |   [Github](https://github.com/net-commander/linux-dist_32)   |      [Github](https://github.com/net-commander/osx-dist)     |      [Github](https://github.com/net-commander/windows-dist.git)      |       [Github](https://github.com/net-commander/web-dist.git)       |
|                |                |                |                 |                  |                   |
|     Help       |  [Installation](http://rawgit.com/xblox/control-freak/master/docs/Installation/Linux.html)  |         [Installation](http://rawgit.com/xblox/control-freak/master/docs/Installation/Linux.html)       |       [Installation](http://rawgit.com/xblox/control-freak/master/docs/Installation/OSX.html)          |        [Installation](http://rawgit.com/xblox/control-freak/master/docs/Installation/Windows.html)          |          [Installation](http://rawgit.com/xblox/control-freak/master/docs/Installation/WEB/index.html)           |
|                |                |                |                 |                  |                   |
|  Has IDE App   |       Yes      |      Yes       |        Yes      |        Yes       |     No, but as <br/>web-app via URL          |
|     Zip        |     [Nightly](http://pearls-media.com/control-freak/?ddownload=3803)        |      [Nightly](http://pearls-media.com/control-freak/?ddownload=3538)       |        [Nightly](http://pearls-media.com/control-freak/?ddownload=3805)      |        [Nightly](http://pearls-media.com/control-freak/?ddownload=3788)       |     [Nightly](http://pearls-media.com/control-freak/?ddownload=3807)         |
|     Installer  |    [DEB - Nightly](http://pearls-media.com/control-freak/?ddownload=3809)         |      [DEB - Nightly](http://pearls-media.com/control-freak/?ddownload=3809)       |       [Nightly DMG](http://pearls-media.com/control-freak/?ddownload=3598)       |        [Nightly](http://pearls-media.com/control-freak/?ddownload=3819)       |      | 



<hr/>


## Contact

[Chat with us](https://control-freak.slack.com/) or send us an email [here.](http://pearls-media.com/control-freak/contact/)

## Documentation

Hosted version [here](http://rawgit.com/xblox/control-freak/master/docs/Getting_Started.html)

<hr/>

### Video - Tutorials

[Basic and detail steps](https://www.youtube.com/watch?v=Jd_SQaJXkBI)

[iOT / MQTT with "Control - Freak"](https://www.youtube.com/watch?v=JC7zArHMs3I)

[Wiring to thethings.io](https://www.youtube.com/watch?v=RbQPf19dmow)

[Building Build-Machines](https://www.youtube.com/watch?v=UCeBVYJq_ug)

[Visual - Editor Basics](https://www.youtube.com/watch?v=JH_WyfFGk8I)

<hr/>

### Keyboard & Mouse

[See documentation](http://rawgit.com/xblox/control-freak/master/docs/Interface/Keyboard.html)

<hr/>

### Bug reports

Please post issues [here](https://github.com/xblox/control-freak/issues)

### Change - Log

<hr/>

## 6.12.2017

- Removed mongodb & player dependencies
- New: Widget states
- New - XBLOX : Block Palette
- Fixed: a lots of VE bugs

## 17.11.2017

- New: VE actions "File/Save as widget", "Widget/Add|Remove|Rename State"
- Changed: default http server now using 0.0.0.0 instead of 'localhost'

## 9.11.2017

- Improved: VE actions "Select->Anchestor/Parent"


## 7.11.2017

- Fixed: settings.json handling
- Improved: grid search
- Fixed: Custom widgets preview


## 3.11.2017

- Visual - Editor : improvments and fixes
- Visual - Editor : New action : 'Save as Widget'
- Visual - Editor : New Palette system
- General: re-open last files upon startup

## 12.10.2017

- Various improvments for VE
- Various fixes in ui and back-end

## 7.09.2017

- Minor fixes for VE
- Fix handling of user/settings|meta.json issues on windows
- Minor ui improvments


## 4.09.2017

- Minor fixes for VE
- Fixed leaked TCP connections

## 31.08.2017

- Minor ui fixes
- Fixes for device message handling in different context's
- Fixes an issue with background - images in Visual editor

## 31.07.2017

- Minor fixes

- Fixed : unsupported languages and missing language files

## 22.07.2017

- Fixed : unsupported languages and missing language files

## 21.07.2017

- Fixed UDP server issue
- Fixed an issue with console messages
- Fixed an issue for exports
- Fixed an issue for leaked servers after CTRL-C
- Fixed an issue with non en-locals
- Fixed an issue with the HTML/Set Style Block

## 28.05.2017

- Fixed: File uploads, catcj MQTT auth errors

## 30.10.2017

- Added CLI interface

## 21.10.2016 - 30.04.2017

- Removed PHP, Nginx & Mongo dependencies


## 20.10.2016

- Fixed: Driver view - instance now refreshed after device reconnected.
- Improved: Performance by removing redundant network messages
- Improved: App-Performance by caching internal queries in stores
- Improved: IDE boot performance by creating driver instances half only


## 9.10.2016

- Fixed: Exporter update to latest foundation code


## 7.10.2016

- Fixed: Lots of VE bugs
- Fixed: XBLOX destroy 
- Added: VE: pseudo script tag <d-script>


## 3.10.2016

- Improved: VLC Driver: Diagnose command, sound card selection
- Improved: VE: outline tree navigation, outline will restore state now after editor changes



## 3.10.2016

- Improved: VLC Driver: accepts now specific selection. Accepts video files
- Added: XBLOX: New Block: File/Read JSON


## 2.10.2016

- Fixed: XBLOX, arguments



## 1.10.2016

- Fixed: Exporter: Loaded wrong default app-module
- Fixed: Exporter: Device-Server wrong hashing, so client - devices were not the same as on the server
- Fixed: Exporter: New Javascript libraries not loaded
- Fixed: Exporter: crashed here and there during export
- Fixed: white spaces in paths
- Fixed: Exporter: system scope wasn't loaded
- Fixed: Web-Server-Release: IDE didn't load for certain user languages
- Improved: Device-Server has now additional arguments: --mongo=false/true/path | --mqtt=false/true (to support non MQTT/Mongo-Setups)
- Improved: Device-Server now proceeds booting when MongoDB server is offline
- Improved: User & System scope has now its own XBlox space, useful to have system/user variable being used in any other scope.


- Fixed: Url issues with web-dist on ARM devices
## 29.09.2016 - 2

- Fixed: Url issues with web-dist on ARM devices


## 29.09.2016

- Changed: Device/Driver tree view sorted by name per default
- Fixed/Improved: IDE CSS cleanup
- Fixed: VE output didn't work well on IE-Edge
- Added: Support for FF
- Added: Support for MS-Edge


## 28.09.2016 - 2
 
- Added: [Web-Server version](https://github.com/net-commander/web-dist.git)


## 28.09.2016

- Fixed: VE: Memory leaks in davinci/ve/States
- Fixed: Redundant variable updates
- Fixed: VLC driver updated "Current Index" wrong
- Fixed: Regression bug crashed device server
- Fixed: Memory leaks when marking blocks
- Improved: File-IO in App mode uses now direct FS API instead of network requests



## 27.09.2016

- Improved: Paste device asks now for new title
- Added: Paste driver implemented
- Improved: VE: New Action Widget/Show in outline


## 21.09.2016

- Fixed: VLC driver
- Improved: Device server restarts automatically
- Fixed: Commands stop/pause/play
- Improved: VE : Driver - Variable - Changed event fired when scene is loaded



## 21.09.2016

- VLC driver added
- Folder - Picker added
- Improved: XBlox : Set Variable block
- Added: XBlox : Stop/Pause Command block   
- Added: Platform : linux_32
- Improved: node js server directories
- Improved: Documentation: new page for device server
- Fixed: XBlox : clipboard
- Improved: XBlox now accepts clipboard buffers from global
- Improved: Custom drivers can now populate GUI in IDE


## 12.09.2016

- Fixed: Device tree view: variable/command duplicates
- Improved: VE: CSSState now accepts CSS class names
- Fixed: Device Server: removed file change debug messages
- Fixed: VE: StyleState/CSSState now accepts integers as style names

## 12.09.2016

- Improved: added action "View/Show/Highlight" in block grids.
- Improved: added extra space in block grid, fixes #68
- Improved: added toggle for enable/disable device
- Improved: added new command field "Special/Type"
- Improved: XBlox: Set Variable: applies now arguments from prev. results 
- Improved: VE: new action Widget/Focus: scrolls to widget if out of view



## 10.09.2016

- Fixed: many device server inconsistencies on Windows, caused reconnecting the same server or client
- Improved: XBlox - Set Variable has now flags to preserve network updates
- Improved: Performance : removed effects in dark, gray, and white but not blue theme.



## 09.09.2016

- Fixed: XBlox: some crashes
- Fixed: XBlox: Step/Back was not working anymore
- Changed: XBlox: merged "Wait for Response" into flag in Command block
- Added: System Driver/Device "Audio-Player"


## 08.09.2016

- Updated: to Electron@1.3.5 
- Fixed: Delimiter wasn't working in console for Udp
- Fixed: VE : Slider selection & move
- Fixed: Status bar messages when sending commands
- Fixed: Error messages in dev-tools for new drivers created
- Fixed: Removed "abort re-connect" when manually stopping user
- Fixed: Device status icon not updated right
- Improved: Device connect actions have now keyboard shortcuts



## 07.09.2016

- Improved: Device server disconnection will now re-store all prev. connected devices
- Improved: Introduced 2 new driver methods: destroy & onLostServer. These methods are auto-chained
- Improved: Introduced auto-chained destroy method for protocols (server side)
- Improved: General performance in apps
- Improved: "Abort Reconnect" action in "device disconnected" 
- Improved: response variable "value" has new "getString" method
- Improved: having "Commands" in response blocks will receive the "value" as argument. Needed for server mode.
- Improved: setVariable method for drivers has 3 new arguments: save, publish & highlight
- Fixed: Device server didn't recognize same devices correctly, causing new connections
 

## 05.09.2016

- Improved: VE: supporting javascript files now
- Improved: General flag "Server" in devices. This is implemented for TCP only. It does what it says and creates a TCP socket server.


## 04.09.2016

- Added: "Driver - View" actions : "View/Layout/Save Layout" & "View/Layout/Restore Layout"
- Improved: General tabs have now red indicators when the content changed, til content is saved. 
- Fixed: VE: some crashes when right click on body element


## 04.09.2016 - 1

- Fixed: user directories with white spaces on windows
- Fixed: update2.bat now pulls lfs explicit on windows
- Fixed: VE: preview was missing custom user directory in RPC url
- Fixed: VE: preview was not loading Font-Awesome
- Fixed: VE: scene reloads too often
- Fixed: VE: crash in surround action


## 03.09.2016 - 1

- Added: VE: added View/Float && View/Dock action = moves all sub panels into floating pane
- Fixed: VE: various bugs when resizing panels
- Fixed: VE: stage's body size style attributes ignored (couldn't scroll full size)


## 02.09.2016 - 2

- Changed: VE: removed view split actions


## 02.09.2016 - 1

- Fixed: VE: background image urls in preview
- Fixed: VE: incorrect CSS file loaded in preview
- Fixed: VE: user directory not taken into account in preview


## 01.09.2016 - 2

- Fixed: File picker now starting with source mount
- Changed: Mark hex off by default
- Fixed: "Global Console" text formatting
- Fixed: "Driver Console" text formatting


## 01.09.2016 - 1

- Improved: Menus have now all a separators
- Improved: Context menus action separators 
- Improved: Block actions grouping 
- Fixed: Multi-delimiter 
- Fixed: "Emit value" in responses was not working


## 22.08.2016

- Fixed: VE : Scene's CSS resources loaded wrong
- Fixed: VE : Scene's JS resources loaded wrong



## 21.08.2016

- Improved: VE : native events will forward its value to the block group
- Fixed: VE : Set-Style block in final app didn't collect objects correctly in "By Id mode"
- Improved: VE : Set-Style block now accepts variables in style string
- Added: XBLOX : Generic "Switch" block. This block will be feeded with "arguments".
- Changed: XBLOX : "Variable Switch" and "Switch" no longer creates default blocks.



## 20.08.2016

- Implemented: Window->Open Folder action to open new user directory (will relaunch)
- Updated: "Electron" to 1.3.3







## 19.08.2016

- Fixed: regression bugs in Driver - View
- Fixed: Drivers : Hex - Display
- Fixed: VE : various things
- Added: Devices : clipboard actions
- Added: Devices : source edit action
- Fixed: Duplicate popups
- Fixed: Driver Hot - Reloading
- Fixed: VE : "Preview in Browser" on Windows fixed

## 16.08.2016

- Fixed: VE : ComboBox
- Added: VE : Select


## 16.08.2016

- Added: VE : Accordion, TabBar, ViewStack, Panel added
- Fixed: VE: lots of small things
- Added: Drivers: MPD raw driver


## 09.08.2016


- Improved: VE : outline view navigation and rendering, context menu added
- Improved: VE : outline view context menu
- Fixed: VE: id generation
- Fixed: VE: visibility toggle in outline
- Improved: File picker uses now standard panel


## 30.07.2016

- Changed: commands are send now as byte array streams. This is tested for TCP, UDP and serial.
IE: checking $80 is in the byte array : return [value].getBytes().indexOf(128) !==-1; //getBytes() returns an integer array with the decimal values of the string.
IE: checking $80 is in the hex string : return [value].hexString().indexOf('80') !==-1; //hexString returns a string of hex values of the byte array "80 ..."
- Fixed: Device's "Driver Options" flag "Show Debug Messages" will spit log messages on the device server console for all protocols.
- Fixed: Blocks with "Send on Startup" didn't trigger anymore: Re-Save driver.
- Removed: various debug messages in chrome console
- Fixed: "Johnny-Five library"



## 29.07.2016

- Improved: re-connect to device server and its notifications
- Changed: coloring for sent/receiving device messages in global console
- Fixed: VE->File/Preview In Browser : Scene CSS was not loaded correctly and crashed the whole app
- Improved: delimiter will be applied (response construction) across multiple packages (MAX total buffer = 512 chars)
- Fixed: Dojo error message in device server
- Fixed: Exported apps didn't connect to device server on other machines



## 28.07.2016

- Changed: serial protocol: default baudrate set to 9600s
- Updated: Documentation regarding serial protocol defaults
- Fixed: a number of issues for the device server
- Added: preview version of the "app" exporter
- Breaking: due to the changes for the app exporter, any scene file must be updated:
 
 


## 15.06.2016

- Fixed: Add block actions in toolbars
- Changed: Command block: auto send field removed due to redundant field "interval"
- Changed: Driver console: split/hex


## 03.06.2016


**Closed & fixed issues:**

- New Command [\#22](https://github.com/net-commander/windows-dist/issues/22)
- Call Command [\#21](https://github.com/net-commander/windows-dist/issues/21)
- Context menu in basic commands allows addition of blocks [\#20](https://github.com/net-commander/windows-dist/issues/20)
- Copy/Cut/Paste in Response window is erratically pasting in variable window as well [\#17](https://github.com/net-commander/windows-dist/issues/17)
- Paste icon not active after copy or cut [\#16](https://github.com/net-commander/windows-dist/issues/16)
- Save In General Properties on expression [\#15](https://github.com/net-commander/windows-dist/issues/15)
- Variable default & persistent values [\#14](https://github.com/net-commander/windows-dist/issues/14)
- Changing variable name not updating in expressions [\#13](https://github.com/net-commander/windows-dist/issues/13)
- Response window expression disappearing [\#12](https://github.com/net-commander/windows-dist/issues/12)
- Toolbar/Header settings [\#11](https://github.com/net-commander/windows-dist/issues/11)
- Variable Add not updating variable menu [\#10](https://github.com/net-commander/windows-dist/issues/10)
- Dialog Box Save [\#9](https://github.com/net-commander/windows-dist/issues/9)
- In line editor for Set variable [\#8](https://github.com/net-commander/windows-dist/issues/8)
- variables & expressions [\#5](https://github.com/net-commander/windows-dist/issues/5)
- Expression files text [\#4](https://github.com/net-commander/windows-dist/issues/4)


## 03.06.2016

- Fixed: XBLOX - Set Variable : memory leaks, response variable "value" not shown, inline edit added for value
- Fixed: Driver - View: bottom grids actions not shown in quick toolbar
- Fixed: internal: grid click event duplicates caused un-necessary overhead


## 02.06.2016

- Changed: XBLOX - If-Block has now else/else - if (context menu)
- Changed: Documentation menu entry points now to ./docs


## 01.06.2016

- Fixes for issues #1, #2, #3, #4, #5
- Fixed - XBLOX: Set - Variable didn't update new variable properly
- Fixed - XBLOX: Run Script didn't replace variables
- Changed: The device server path is now at server/nodejs instead of Code/utils/app/xide
- Changed: All files moved to the repo's root level instead of having them in "Control-Freak"


## 25.05.2016

- Lots & lots of fixes for Visual Editor ("VE")
- Added: "Set-Style" block
- Added: "flags" for commands blocks
- Fixed: driver settings (input was not possible)
- Fixed: some CSS for the IDE
- Changed: Js libraries now minified
- Breaking changes VE: HTML - Base - Url points now to the surrounding folder instead of the workspace url
- Updated: Electron to version 1.1.2
- Fixed: Device server did create block scopes regardless of the "Runs on server" flag being off