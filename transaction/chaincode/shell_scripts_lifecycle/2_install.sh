#!/bin/bash
# peer lifecycle chaincode install transaction.tar.gz
# peer lifecycle chaincode queryinstalled --output json
set -x #echo on

CHAINCODE_NAME="transaction"
CHAINCODE_VERSION="1.0"
PACKAGE_NAME="${CHAINCODE_NAME}.tar.gz"
CHAINCODE_LABEL="${CHAINCODE_NAME}_${CHAINCODE_VERSION}"
CHANCODE_LANGUAGE="node"
PWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"   
CHAINCODE_DIR=${PWD%/*}
CHAINCODE_SRC_CODE_PATH="$CHAINCODE_DIR/src"

export ORGANISATION_NAME="hlfMSP"
export PEER_HOST=peer2
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=${ORGANISATION_NAME}
export CORE_PEER_TLS_ROOTCERT_FILE=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp
export CORE_PEER_ADDRESS=${PEER_HOST}:7051

peer lifecycle chaincode install ${PACKAGE_NAME} &&
peer lifecycle chaincode queryinstalled --output json