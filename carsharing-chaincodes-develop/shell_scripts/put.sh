#!/bin/bash
set -x #echo on

export CORE_PEER_ADDRESS="peer2:7051"
export CORE_PEER_MSPCONFIGPATH="/root/admin/msp"
export CORE_PEER_TLS_ROOTCERT_FILE="/root/${PEER2_HOST}/tls-msp/tlscacerts/tls-${TLSCA_HOST}-7054.pem"
export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH
export CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE


peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","1", "ark", "2000", "solar panel, wind mill", "700", "Enegry at affordable price", "2","100", "50" ,"250","300","200","4"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","2", "srk", "2500", "solar panel", "500", "Lowest quoted price", "1","200", "100","350","40","320","3"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","3", "demo", "1000", "wind mill", "200", "Enegry from green sources", "3","150", "200","450","20","400","4.5"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE} &&
peer chaincode invoke -C appchannel -n energycc -c '{"Args":["createUser","4", "articonf", "3000", "solar panel, wind mill", "1000", "Solar and wind powered energy, "1","100", "50","150","100","20","2.5"]}' --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
