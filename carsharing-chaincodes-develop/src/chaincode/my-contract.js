/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const shim = require('fabric-shim');
// const { Contract } = require('fabric-contract-api');
const { ClientIdentity } = require('fabric-shim');
const assert = require('assert');
const { SmartEnergyUserAsset } = require('./SmartEnergyUserAsset');


const util = require('./util');

let smartEnergyUserAsset = new SmartEnergyUserAsset();


let myContract;


class MyContract {

    async Init(stub) {
        myContract = new MyContract();

        try {
            return shim.success();
        } catch (e) {
            return shim.error(e);
        }
    }

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();

        let method = this[ret.fcn];
        if (!method) {
            console.log('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }

        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }


    async createUser(stub, args) {
        let [userId] = args;

        let asset = await userAsset.create(userId);

        let buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(userId, buffer);

        return buffer;
    }

    // // user ------------------------------------------------------------------------------

    async createUser(stub, args) {
        //let [userId, brand, model, colour, seats, yearOfEnrollment, observations] = args;
        let [userId, userName, capacity, source, selling, postText, price,reserverPower, minSellingThreshold] = args;
        const exists = await myContract.assetExists(stub, userId);
        if (exists) {
            let user = await myContract.readAsset(stub, userId);
            // if (user.notDeleted == true) {
            //     throw new Error(`The my asset ${userId} exist`);
            // }
        }

        let cid = new ClientIdentity(stub);
        let userId = cid.getID();

        let asset = await smartEnergyUserAsset.create(userId, userName, capacity, source, selling, postText, price,reserverPower, minSellingThreshold);
        let buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(userId, buffer);


        return buffer;
    }

    async updateUser(stub, args) {
        let [userId, userName, capacity, source, selling, postText, price,reserverPower, minSellingThreshold] = args;
        
        const exists = await myContract.assetExists(stub, userId);
        if (!exists) {
            throw new Error(`The my asset ${userId} does not exist`);
        }
        const user = await myContract.readAsset(stub, userId)
        // if (user.notDeleted == false) {
        //     throw new Error(`You can not edit a user that is deleted`)
        // }
        // const notDeleted = user.notDeleted

        let cid = new ClientIdentity(stub);
        let userId = cid.getID();

        // assert.equal(user.userId, userId, 'You can not edit this user');

        const asset = await smartEnergyUserAsset.edit(userId, userName, capacity, source, selling, postText, price,reserverPower, minSellingThreshold);

        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(userId, buffer);

        return buffer;
    }

    // async deleteuser(stub, args) {
    //     let [userId] = args;
    //     let cid = new ClientIdentity(stub);
    //     let clientID = cid.getID();
    //     const user = await myContract.readAsset(stub, userId)
    //     assert.equal(user.userId, clientID, 'You cannot delete a user you dont own')

    //     let queryString = {};
    //     queryString.selector = {};
    //     queryString.selector.docType = 'offer';
    //     queryString.selector.notDeleted = true;
    //     queryString.selector.user = {};
    //     queryString.selector.user.userId = userId;

    //     const buffer = await myContract.getQueryResultForQueryString(stub, JSON.stringify(queryString));
    //     let offers = JSON.parse(buffer.toString());

    //     assert.equal(offers.length, 0, 'You cannot delete a user within a Offer')

    //     const asset = await smartEnergyUserAsset.deleteuser(user, "false");

    //     await myContract.saveAssetState(stub, userId, asset);
    //     let bufferuser = Buffer.from(JSON.stringify(asset));

    //     return bufferuser;
    // }

    async findAllUsersById(stub) {
        let clientLogged = await myContract.getClientLogged(stub);
        clientLogged = JSON.parse(clientLogged.toString());

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'user';
        queryString.selector.userId = clientLogged;
        //queryString.selector.notDeleted = true;

        const buffer = await myContract.getQueryResultForQueryString(stub, JSON.stringify(queryString));

        return buffer;
    }

    async findOneUser(stub, args) {
        let [userId] = args;

        let asset = await myContract.readAsset(stub, userId);
        assert.equal(asset.docType, 'user', 'user not found');
        let buffer = Buffer.from(JSON.stringify(asset));

        return buffer;
    }

    async listUsers(stub) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'user';

        const buffer = await myContract.getQueryResultForQueryString(stub, JSON.stringify(queryString));
        const asset = JSON.parse(buffer.toString());


        return buffer;
    }

   


    // // OTHERS ---------------------------------------------------------------------------
    async saveAssetState(stub, id, asset) {
        let buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(id, buffer);
    }

    async getClientLogged(stub) {
        let cid = new ClientIdentity(stub);
        let clientLogged = cid.getID();

        // assert(clientLogged.includes('OU=client'), 'User logged must be a client');

        let buffer = Buffer.from(JSON.stringify(clientLogged));
        return buffer;
    }

    async getAdminLogged(stub) {
        let cid = new ClientIdentity(stub);
        let adminLogged = cid.getID();

        assert(adminLogged.includes('OU=admin'), 'User logged must be a admin');

        return adminLogged;
    }


    async assetExists(stub, assetId) {
        const buffer = await stub.getState(assetId);
        return (!!buffer && buffer.length > 0);
    }

    async readAsset(stub, assetId) {
        const exists = await myContract.assetExists(stub, assetId);
        if (!exists) {
            throw new Error(`The my asset ${assetId} does not exist`);
        }

        const buffer = await stub.getState(assetId);
        const asset = JSON.parse(buffer.toString());

        return asset;
    }

    async deleteAsset(stub, args) {
        let [assetId] = args;
        await util.deleteAsset(stub, assetId);
    }

    async getQueryResultForQueryString(stub, queryString) {

        let resultsIterator = await stub.getQueryResult(queryString);
        let results = await myContract.getAllResults(resultsIterator, false);

        return Buffer.from(JSON.stringify(results));
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];

        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

}

// module.exports = MyContract;
shim.start(new MyContract());