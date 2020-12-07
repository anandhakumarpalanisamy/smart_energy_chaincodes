#!/bin/bash
# peer chaincode query -C appchannel -n smart-meter -c '{"Args":["GetAllAssets"]}'

set -x #echo on

CHAINCODE_NAME="smart-meter"
CHANNEL_NAME="appchannel"
QUERY_PARAMS='{"Args":["GetAllAssets"]}'
export ORGANISATION_NAME="hlfMSP"

export PEER_HOST=peer2
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=${ORGANISATION_NAME}
export CORE_PEER_TLS_ROOTCERT_FILE=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp
export CORE_PEER_ADDRESS=${PEER_HOST}:7051

export ORDERER_CA=/root/CLI/${ORGCA_HOST}/${ORDERER_HOST}/msp/tls/ca.crt
export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq .installed_chaincodes[0].package_id)

peer chaincode query -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} -c ${QUERY_PARAMS}