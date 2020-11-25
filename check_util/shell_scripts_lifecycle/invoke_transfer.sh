#!/bin/bash
# peer chaincode invoke -o orderer:7050 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt -C appchannel -n smart-meter --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt -c '{"Args":["InitLedger"]}'
set -x #echo on

CHAINCODE_NAME="smart-meter"
CHANNEL_NAME="appchannel"
INVOKE_PARAMS='{"Args":["TransferBalance","ark","srk","5"]}'
export ORGANISATION_NAME="hlfMSP"

export PEER_HOST=peer2
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=${ORGANISATION_NAME}
export CORE_PEER_TLS_ROOTCERT_FILE=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp
export CORE_PEER_ADDRESS=${PEER_HOST}:7051

export ORDERER_CA=/root/CLI/${ORGCA_HOST}/${ORDERER_HOST}/msp/tls/ca.crt
export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq .installed_chaincodes[0].package_id)

#peer chaincode invoke -o ${ORDERER_HOST}:7050 --tls --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} --peerAddresses ${CORE_PEER_ADDRESS} --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE} -c ${INSTANTIATE_PARAMS}
peer chaincode invoke -o ${ORDERER_HOST}:7050 --tls --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} --peerAddresses ${CORE_PEER_ADDRESS} --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE} -c ${INVOKE_PARAMS}