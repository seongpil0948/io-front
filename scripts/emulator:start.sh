sh scripts/killPort.sh 8085
sh scripts/killPort.sh 5179
sh scripts/killPort.sh 5173
sh scripts/killPort.sh 9099
sh scripts/killPort.sh 5001
sh scripts/killPort.sh 9199
sh scripts/killPort.sh 9000
sh scripts/killPort.sh 8085
sh scripts/killPort.sh 8080
sh scripts/killPort.sh 4000
sh scripts/killPort.sh 4001
firebase use io-box-develop
# firebase emulators:start --import=test/fixture/savedData --export-on-exit
# firebase emulators:start --import=test/fixture/savedData --project=demo-io-box-develop
source ~/.nvm/nvm.sh
nvm use 16
firebase emulators:start  --project=io-box-develop
