#!/bin/bash
set -x #echo on

export CORE_PEER_ADDRESS="peer2:7051"
export CORE_PEER_MSPCONFIGPATH="/root/admin/msp"
export CORE_PEER_TLS_ROOTCERT_FILE="/root/${PEER2_HOST}/tls-msp/tlscacerts/tls-${TLSCA_HOST}-7054.pem"
export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH
export CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE

CHAINCODE_NAME="arkcar"
peer chaincode invoke -C appchannel -n $CHAINCODE_NAME -c '{"Args":["createCar","Blue","Opel","Corsa","Anand"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
