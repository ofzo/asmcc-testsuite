apt-get install -y cmake ninja-build
git clone https://github.com/WebAssembly/wabt
cd wabt
git submodule update --init &&  mkdir build && cd build && cmake .. && cmake --build .
cd ../..

git clone https://github.com/WebAssembly/testsuite
cd testsuite
git submodule update --init && bash ./extract-parts.sh

npm ci
mkdir output && node src/main.js
