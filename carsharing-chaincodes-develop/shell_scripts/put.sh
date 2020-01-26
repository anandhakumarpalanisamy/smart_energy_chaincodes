#!/bin/bash
set -x #echo on

export CORE_PEER_ADDRESS="peer2:7051"
export CORE_PEER_MSPCONFIGPATH="/root/admin/msp"
export CORE_PEER_TLS_ROOTCERT_FILE="/root/${PEER2_HOST}/tls-msp/tlscacerts/tls-${TLSCA_HOST}-7054.pem"
export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH
export CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE


peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","1", "ark", "2000", "solar panel, wind mill", "700", "Enegry at affordable price", "2","100", "50"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","2", "srk", "2500", "solar panel", "500", "Enegry at affordable price", "1","200", "100"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","3", "demo", "1000", "wind mill", "200", "Enegry at affordable price", "3","150", "200"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","4", "articonf", "3000", "solar panel, wind mill", "1000", "Enegry at affordable price", "1","300", "100"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
