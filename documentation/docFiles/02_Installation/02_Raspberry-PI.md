### Pre-Requisites

#### Mongo-Server (when using pre-compiled built-in server)

    #sudo apt-get install libpcrecpp0
    #sudo apt-get install install libsnappy1
    
#### Mongo-Server (when using web-server release)

    #sudo apt-get install mongodb-server
    

#### PHP Shell addon 
    
    #sudo apt-get install gawk
    

### MQTT Stack

    apt-get install libzmq3


### VLC - Driver

    sudo apt-get install libvlc-dev

### Audio - Driver
    sudo apt-get install libasound2-dev


### GPIO - Driver
    
    sudo apt-get install python3-pigpio

### OpenCV - Base 

    sudo apt-get install libjpeg-dev libtiff5-dev libjasper-dev libpng12-dev -y
    sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev -y
    sudo apt-get install libgtk2.0-dev -y
    sudo apt-get install libatlas-base-dev gfortran -y
    
    cd ~/workspace
    mkdir opencv
    cd opencv
    git clone https://github.com/Itseez/opencv.git
    git clone https://github.com/Itseez/opencv_contrib.git
    
    cd opencv
    
    cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D BUILD_SHARED_LIBS=ON \
    -D OPENCV_EXTRA_MODULES_PATH=~/workspace/opencv/opencv_contrib/modules \
    -D BUILD_PERF_TESTS=OFF \
    -D BUILD_TESTS=OFF \
    -D BUILD_NEW_PYTHON_SUPPORT=ON \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D BUILD_DOCS=OFF .
    
    
    make -j4
    sudo make install
    sudo ldconfig
    
    pip3 install "picamera[array]"

