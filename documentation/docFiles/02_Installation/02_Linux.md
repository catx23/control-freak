### **Installation via zip **

[download here 64 Bit](http://pearls-media.com/control-freak/?ddownload=3583)

[download here 32 Bit](http://pearls-media.com/control-freak/?ddownload=3803)

Uncompress the zip file to location like /opt/Control-Freak. 


### **Installation via deb **

[download here 64 Bit](http://pearls-media.com/control-freak/?ddownload=3809)

[download here 32 Bit](http://pearls-media.com/control-freak/?ddownload=3810)

Uncompress the zip file to location like /opt/Control-Freak



### **Download via git (Recommended since you can receive updates with this method)**

1.Download and install [git](https://git-scm.com/download/linux) or make sure **git** is installed (_apt-get install git_)

2.Download and install [git-lfs](https://git-lfs.github.com/)

3.In a new console, after git-lfs install:    
        
        # sudo mkdir -p /opt/Control-Freak

Linux - 32 Bit

        # git clone https://github.com/net-commander/linux-dist-32.git /opt/Control-Freak
        
Linux - 32 Bit
    
        # git clone https://github.com/net-commander/linux-dist.git /opt/Control-Freak

4.If the exe files are corrupt or it won't start:
 
        # git lfs pull

<hr/>

### Start 

1.Run in "Control-Freak/"
        
        ./start_linux.sh (Wait until a notification comes up: You can start now “Control-Freak\Control-Freak”)

2.Start now the IDE in "./Control-Freak" :
        
        # ./Control-Freak

<hr/>

### Updates

#### Zip installation

1.Close all windows of Control-Freak (stop_server.sh)

2.Re-download and uncompress the zip over your existing installation

<hr/>

#### Via git

    # cd ./Control-Freak
    # git reset --hard origin
    # git pull
    
Note: Do not modify the existing files in Control-Freak/data. Only add files.




