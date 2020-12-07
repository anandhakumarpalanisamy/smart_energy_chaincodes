#!/bin/bash
# peer lifecycle chaincode commit -o orderer:7050 --channelID appchannel --name smart-meter --version 1.0 --sequence 1 --tls --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt --peerAddresses peer2:7051 --tlsRootCertFiles /root/CLI/orgca/peer2/msp/tls/ca.crt
# peer lifecycle chaincode querycommitted --channelID appchannel --name smart-meter --cafile /root/CLI/orgca/orderer/msp/tls/ca.crt
set -x #echo on

CHAINCODE_NAME="smart-meter"
CHAINCODE_VERSION="1.0"
PACKAGE_NAME="${CHAINCODE_NAME}.tar.gz"
CHAINCODE_LABEL="${CHAINCODE_NAME}_${CHAINCODE_VERSION}"
CHANCODE_LANGUAGE="node"
PWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"   
CHAINCODE_DIR=${PWD%/*}
CHAINCODE_SRC_CODE_PATH="$CHAINCODE_DIR/src"

export ORGANISATION_NAME="hlfMSP"
SIGNATURE_POLICY="OR('${ORGANISATION_NAME}.peer')"
CHANNEL_NAME="appchannel"
SEQUENCE="1"

export PEER_HOST=peer2
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=${ORGANISATION_NAME}
export CORE_PEER_TLS_ROOTCERT_FILE=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp
export CORE_PEER_ADDRESS=${PEER_HOST}:7051

export CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq .installed_chaincodes[0].package_id)
export ORDERER_CA=/root/CLI/${ORGCA_HOST}/${ORDERER_HOST}/msp/tls/ca.crt

peer lifecycle chaincode commit -o ${ORDERER_HOST}:7050 --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --sequence ${SEQUENCE} --tls --cafile ${ORDERER_CA} --peerAddresses ${CORE_PEER_ADDRESS} --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer lifecycle chaincode querycommitted --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --cafile ${ORDERER_CA}
