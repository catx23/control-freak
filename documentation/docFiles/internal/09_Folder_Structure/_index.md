
<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;border-color:#ccc;}
.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#ccc;color:#333;background-color:#fff;}
.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#ccc;color:#333;background-color:#f0f0f0;}
.tg .tg-yw4l{vertical-align:top}
</style>

This section describes the folder structure for all possible deployment modes :

1.  **Control-Freak installed** (when downloaded and installed from official sources)

2. **Developer** is the version with all source code (non-minified)

### 1. 'Control-Freak' installed


**System Variables** (OS specific defaults):

*INSTALL_DIR*

- Windows:     C:\Program Files\ControlFreak\
- Linux: 	      /opt/control-freak/
- Mac:            /Applications/control-freak/

*USER_DIR*

- Windows:     C:\Users\JonDoe\.cf
- Linux: 	      /home/JonDoe/.cf
- Mac:            /Users/.cf/

**Locations**:

<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;border-color:#ccc;}
.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#ccc;color:#333;background-color:#fff;}
.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#ccc;color:#333;background-color:#f0f0f0;}
.tg .tg-baqh{text-align:center;vertical-align:top}
.tg .tg-e3zv{font-weight:bold}
.tg .tg-amwm{font-weight:bold;text-align:center;vertical-align:top}
.tg .tg-yw4l{vertical-align:top}
.tg .tg-9hbo{font-weight:bold;vertical-align:top}
</style>
<table class="tg" style="undefined;table-layout: fixed; width: 988px">
<colgroup>
<col style="width: 197px">
<col style="width: 282px">
<col style="width: 257px">
<col style="width: 173px">
<col style="width: 79px">
</colgroup>
  <tr>
    <th class="tg-e3zv">Name</th>
    <th class="tg-e3zv">Description</th>
    <th class="tg-e3zv">Location</th>
    <th class="tg-amwm">Variable</th>
    <th class="tg-yw4l">Updates</th>
  </tr>
  <tr>
    <td class="tg-9hbo">General folders</td>
    <td class="tg-yw4l"></td>
    <td class="tg-yw4l"></td>
    <td class="tg-baqh"></td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">Workspace</td>
    <td class="tg-yw4l">The user's own workspace folder</td>
    <td class="tg-yw4l">USER_DIR\workspace<br></td>
    <td class="tg-baqh">workspace</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">App-Directory</td>
    <td class="tg-yw4l">the directory of an deployed application</td>
    <td class="tg-yw4l">anywhere</td>
    <td class="tg-baqh">app-directory</td>
    <td class="tg-yw4l">optional</td>
  </tr>
  <tr>
    <td class="tg-yw4l">Device-Control-Server</td>
    <td class="tg-yw4l">the location of the device control server</td>
    <td class="tg-yw4l">INSTALL_DIR/device-control-server or app-directory/device-control-server</td>
    <td class="tg-yw4l">device-control-server</td>
    <td class="tg-yw4l">optional</td>
  </tr>
  <tr>
    <td class="tg-9hbo">Drivers</td>
    <td class="tg-yw4l">Default driver locations</td>
    <td class="tg-yw4l"></td>
    <td class="tg-baqh"></td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-031e">System - Drivers</td>
    <td class="tg-031e">All global known drivers</td>
    <td class="tg-031e">INSTALL_DIR/data/driver/system</td>
    <td class="tg-baqh">system-drivers</td>
    <td class="tg-yw4l">yes</td>
  </tr>
  <tr>
    <td class="tg-031e">User - Drivers</td>
    <td class="tg-031e">The user's drivers</td>
    <td class="tg-031e">workspace/drivers</td>
    <td class="tg-baqh">user-drivers</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">Project - Drivers</td>
    <td class="tg-yw4l">App only drivers</td>
    <td class="tg-yw4l">workspace/project-name/drivers</td>
    <td class="tg-baqh">project-drivers</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-9hbo">Devices</td>
    <td class="tg-yw4l">Default device date locations</td>
    <td class="tg-yw4l"></td>
    <td class="tg-baqh"></td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">System - Devices</td>
    <td class="tg-yw4l">All known system devices such as the loopback device for testing</td>
    <td class="tg-yw4l">INSTALL_DIR/data/devices/system</td>
    <td class="tg-baqh">system-devices</td>
    <td class="tg-yw4l">yes</td>
  </tr>
  <tr>
    <td class="tg-yw4l">User - Devices<br></td>
    <td class="tg-yw4l">The user's devices </td>
    <td class="tg-yw4l">workspace/devices</td>
    <td class="tg-baqh">user-devices</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">Project - Devices</td>
    <td class="tg-yw4l">App only devices</td>
    <td class="tg-yw4l">workspace/project-name/devices</td>
    <td class="tg-baqh">project-devices</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-9hbo">Logs</td>
    <td class="tg-yw4l">Default locations for log files</td>
    <td class="tg-yw4l"></td>
    <td class="tg-baqh"></td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">System - Logs</td>
    <td class="tg-yw4l">all system related log files</td>
    <td class="tg-yw4l">INSTALL_DIR/logs/</td>
    <td class="tg-baqh">system-log-directory</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">User - Logs</td>
    <td class="tg-yw4l">all user logs</td>
    <td class="tg-yw4l">workspace/logs/</td>
    <td class="tg-baqh">user-log-directory</td>
    <td class="tg-yw4l"></td>
  </tr>
  <tr>
    <td class="tg-yw4l">App - Log</td>
    <td class="tg-yw4l">all app logs</td>
    <td class="tg-yw4l">workspace/project-name/logs or app-directory/logs</td>
    <td class="tg-baqh">app-log-directory</td>
    <td class="tg-yw4l"></td>
  </tr>
</table>

**Data scopes as diagram**

<img src="../assets/folders/scopes.png" class="img-responsive center-block"  style="">

**Remarks**


**Links**

**FAQ**

1. **Why different locations ('scopes') like system/users/app ?** 

By separating items into different directories, an administrator 
has the possibilities: 
- secure this folders with OS's file system security
- he can easily manage this folders compared to a database solution. For instance he can put these folders also into the cloud or on a network drive

2. **Can I edit these items with my editor?**

yes, all data is based on open standards like JSON. Changing these files will most of the time also update the IDE or the control-application.

3. **So I can copy paste files among these scopes as I like?**

yes, as long you have the permissions, you can simply copy & paste items also outside of the IDE (which is being updated)

4. **What does these 'variables' mean?**

Variables are used all over the place to avoid hard-coded strings. 

Also, the IDE is providing various scripting possibilities. For instance there are some callbacks when files are changed or added. A user might listen to these events and run his scripts (Javascript or xBlox or shell). In any case, the system resolves all variables into strings at run-time, so that you can use the blocks "Copy Directory" with these variables. Ideally, a user might change some paths but no changes in scripts are required.











