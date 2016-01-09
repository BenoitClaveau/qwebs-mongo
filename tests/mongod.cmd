pushd %~dp0
mongod.exe --dbpath ./data/db --journal
popd .
