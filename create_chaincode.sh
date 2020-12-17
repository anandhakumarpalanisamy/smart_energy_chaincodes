#!/bin/bash
set -x #echo on
​
CHAINCODE_NAME="transaction"
CHAINCODE_CLASS_NAME="TransactionChaincode"
platform='unknown'

git clone https://github.com/bityoga/fabric_chaincode_template.git $CHAINCODE_NAME

unamestr=$(uname)
if [ "$unamestr" = 'Linux' ]; then
   platform='linux'
elif [ "$unamestr" = 'FreeBSD' ]; then
   platform='freebsd'
fi

if [ "$platform" = 'linux' ]; then

   find ./$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/AssetUtil.json -type f -exec sed -i "s/AssetUtil/$CHAINCODE_CLASS_NAME/g" {} \; && 
   find ./$CHAINCODE_NAME/chaincode/ -type f -exec sed -i "s/CHAINCODE-NAME/$CHAINCODE_NAME/g" {} \; && 
   find ./$CHAINCODE_NAME/chaincode/ -type f -exec sed -i "s/CHAINCODE_CLASS_NAME/$CHAINCODE_CLASS_NAME/g" {} \;

elif [ "$platform" = 'freebsd' ]; then
  find ./$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/AssetUtil.json -type f -exec sed -i '.bak' "s/AssetUtil/$CHAINCODE_CLASS_NAME/g" {} \;&& 
  find ./$CHAINCODE_NAME/chaincode/ -type f -exec sed -i '.bak' "s/CHAINCODE-NAME/$CHAINCODE_NAME/g" {} \;&&
  find ./$CHAINCODE_NAME/chaincode/ -type f -exec sed -i '.bak' "s/CHAINCODE_CLASS_NAME/$CHAINCODE_CLASS_NAME/g" {} \;

fi

mv ./$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/AssetUtil.json ./$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/index$CHAINCODE_CLASS_NAME.json 
rm ./$CHAINCODE_NAME/create_chaincode.sh
rm ./$CHAINCODE_NAME/.gitignore
rm ./$CHAINCODE_NAME/LICENSE
rm ./$CHAINCODE_NAME/README.md
rm -rf ./$CHAINCODE_NAME/.git