cd -- "$(dirname "$0")"

if [ -d "../Contents/Frameworks" ]; then
    cd ../Contents
    rm -rf Frameworks
    cd ..
fi

cd ../..

git reset --hard origin
git pull


cd Control-Freak.app


if [ ! -d "Contents/Frameworks" ]; then
    cd Contents
    tar xvf frameworks.tar
fi




