cd -- "$(dirname "$0")"

if [ ! -d "../Contents/Frameworks" ]; then
    cd ../Contents
    tar xvf frameworks.tar
    cd ../Resources
fi

cd server/osx

./server noob --type=OFFLINE_RELEASE --release=true --root="../.." "$@"