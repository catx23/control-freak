### Requirements - IDE: 

1. Windows-7-10 x64
2. A good/recent computer with at least 2Ghz and 4GB RAM and hardware accelerated graphic card

### Requirements - Device - Server :

1. Windows-7-10 x64 or x32


### **Installation via zip [download here](http://pearls-media.com/control-freak/?ddownload=3788)**

Uncompress the zip file to location like C:\Control-Freak. Its important that the location is not a too deep folder due to path length limitations of the Windows platform

### **Installation via Installer [download here](http://pearls-media.com/control-freak/?ddownload=3819)**

Choose an install location like C:\Control-Freak. Its important that the location is not a too deep folder due to path length limitations of the Windows platform.

### **Download via git (Recommended since you can receive updates with this method)**

 1.Download and install [git](https://git-scm.com/download/win)

 2.Download and install [git-lfs](https://git-lfs.github.com/)

 3.In a new console, after git-lfs install: 
    
        # git clone https://github.com/net-commander/windows-dist.git Control-Freak

 4.If the exe files are corrupt or it won't start:
 
        # git lfs pull

<hr/>

### Start 

1. Run c:\Control-Freak\start.bat (Wait until a notification comes up: You can start now “Control-Freak\Control-Freak.exe”)

2. Run Control-Freak\Control-Freak.exe

<hr/>


### Updates 

#### Zip installation

1. Close all windows of Control-Freak (stop_server.bat)

2. Re-download and uncompress the zip over your existing installation

<hr/>

#### Via git

    # double click in c:\Control-Freak\update2.bat or:
    # git reset --hard origin
    # git pull
    
Note: Do not modify the existing files in Control-Freak/data. Only add files.


