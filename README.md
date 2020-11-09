# Smart Energy Chaincodes
Chaincodes for Smart Energy App

 Get into CLI container

 - cd chaincodes/
 - git clone https://github.com/bityoga/smart_energy_chaincodes.git
 - cd smart_energy_chaincodes/energy_chaincode/shell_scripts_lifecycle/

 **Set Environment Variables:**
 
    export ORGANISATION_NAME="hlfMSP"
    export PEER_HOST=peer2
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID=${ORGANISATION_NAME}
    export CORE_PEER_TLS_ROOTCERT_FILE=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp
    export CORE_PEER_ADDRESS=${PEER_HOST}:7051
    export ORDERER_CA=/root/CLI/${ORGCA_HOST}/${ORDERER_HOST}/msp/tls/ca.crt

**Chaincode Lifecycle Install Steps**

1) **Package Chaincode**

       peer lifecycle chaincode package energy.tar.gz --path ../src/ --lang node --label energy_1.0


2) **Install Chaincode**

       peer lifecycle chaincode install energy.tar.gz
       peer lifecycle chaincode queryinstalled --output json

**Set PACKAGE_ID environmental variable**

    export CC_PACKAGE_ID="PACKAGE ID GOT IN PERVIOUS STEP"

3) **Approve Chaincode definition for organisation**

       peer lifecycle chaincode approveformyorg -o orderer:7050 --channelID appchannel --name energy --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt

4) **Check Commit Readiness**

       peer lifecycle chaincode checkcommitreadiness --channelID appchannel --name energy --version 1.0 --sequence 1 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt --output json

5) **Commit Chaincode Definition to Channel**

       peer lifecycle chaincode commit -o orderer:7050 --channelID appchannel --name energy --version 1.0 --sequence 1 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt

       peer lifecycle chaincode querycommitted --channelID appchannel --name energy --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt

**Query Examples**

    peer chaincode query -C appchannel -n energy -c '{"Args":["GetAllAssets"]}'


    peer chaincode query -C appchannel -n energy -c '{"Args":["GetAssetHistory","ark"]}'




**Invoke Examples**

**Invoke InitLedger**

    peer chaincode invoke -o orderer:7050 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt -C appchannel -n energy --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt -c '{"Args":["InitLedger"]}'

**Invoke CreateAsset**

    peer chaincode invoke -o orderer:7050 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt -C appchannel -n energy --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt -c '{"Args":["CreateAsset","ark","1000","Initial Credit"]}'

    peer chaincode invoke -o orderer:7050 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt -C appchannel -n energy --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt -c '{"Args":["CreateAsset","srk","1000","Initial Credit"]}'

**Invoke TransferBalance**

    peer chaincode invoke -o orderer:7050 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt -C appchannel -n energy --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt -c '{"Args":["TransferBalance","ark","srk","5"]}'


