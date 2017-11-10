Deployment Guide
================

## Overview

[General](#General)

[FAQ](#FAQ)


### <a name="General"></a>General

This guide is about publishing, previewing and deploying an application
or designer files.

**Modes**

A Control-Freak application can be tested or used on devices in different modes:

 1. **"Open in new Window"** is a mode for quick viewing a scene file on a device(mobile & desktop) by opening simply an URL. This mode requires a complete IDE and device-control server installation in the local network(LAN). Sharing this scene over internet might be possible when using port-forwarding to the IDE and device-control-server.
 2. **"Export as folder"**. This mode will open a wizard and enables to setup all important settings like the IP address to the device-control-server. It basically creates a sub folder relative to the chosen HTML file and includes all files needed to run the scene. In the network settings you can chose the IDE instance or the stand-alone server packaged with the subfolder. This mode is ideal to run scenes anywhere in the LAN without having the IDE installed. 

 2. **"Export as application"**. This mode will open a wizard and enables to setup all important settings like the IP address to the device-control-server. It basically creates a sub folder relative to the chosen HTML file and includes all files needed to open it with the tools for deploying "Apache-Cordova' applications. For instance, for iOS applications, it exports a regular "XCode" project, and for Android, it exports a regular Google-Android-Eclipse project. This mode is the final step but it has its limitations. Basing on the settings chosen during the export wizard, its possible that an application needs to be re-submitted(app update) to the app-store. 

|Name	|Description|Needs IDE|Mobile Support	|Optimized	| In Sync|LAN only|Opens anywhere|
|---|---|---|---|---|---|---|---|
|Open in new window|This mode is accessible in the file-manager through right click on the file, then click "Open in New Window"|yes|yes|no|yes|yes|yes|
|Export as folder|This mode is accessible through the "Visual Editor" and exports all resources and dependencies, ready to be deployed anywhere.|no|yes|yes|no|yes|yes|
|Export as application|This mode is accessible through the "Visual Editor" and exports all resources and dependencies |no|yes|optional|optional|optional|on installed devices|


**Glossary**

 - **"In Sync"**

### <a name="FAQ"></a>FAQ



<hr/>

