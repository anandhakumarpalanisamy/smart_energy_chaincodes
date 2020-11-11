/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
const moment = require("moment");

class UserChaincode extends Contract {
  async InitLedger(ctx) {
    const assets = [];

    for (const asset of assets) {
      asset.docType = "asset";
      await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
      console.info(`User ${asset.ID} initialized`);
    }
  }

  // CreateAsset issues a new asset to the world state with given details.
  async CreateAsset(ctx, id, balance, type) {
    const asset = {
      ID: id,
      Balance: balance,
      Type: type,
    };
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }
  // CreateAsset issues a new asset to the world state with given details.
  async CreateAssetJson(ctx, assetJSON) {
    // Parse json object
    const assets = JSON.parse(assetJSON);

    // If array of objects, loop through them
    if (Array.isArray(assets)) {
      for (const asset of assets) {
        asset.docType = "asset";
        await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${asset.ID} initialized`);
      }
    } else {
      assets.docType = "asset";
      await ctx.stub.putState(assets.ID, Buffer.from(JSON.stringify(assets)));
      console.info(`Asset ${assets.ID} initialized`);
    }
  }

  // ReadAsset returns the asset stored in the world state with given id.
  async ReadAsset(ctx, id) {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The user ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  async UpdateAsset(ctx, id, updatedAsset) {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The user ${id} does not exist`);
    }

    // overwriting original asset with new asset
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
  }

  // DeleteAsset deletes an given asset from the world state.
  async DeleteAsset(ctx, id) {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The user ${id} does not exist`);
    }
    return ctx.stub.deleteState(id);
  }

  // AssetExists returns true when asset with given ID exists in world state.
  async AssetExists(ctx, id) {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  // TransferAsset updates the owner field of asset with given id in the world state.
  async TransferAsset(ctx, id, newOwner) {
    const assetString = await this.ReadAsset(ctx, id);
    const asset = JSON.parse(assetString);
    asset.Owner = newOwner;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }

  // GetAsset returns the asset stored in the world state with given id.
  async GetAsset(ctx, id) {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The user ${id} does not exist`);
    }
    return assetJSON;
  }

  // TransferAsset updates the owner field of asset with given id in the world state.
  async TransferBalance(ctx, seller_id, buyer_id, amount) {
    const seller_asset_string = await this.ReadAsset(ctx, seller_id);
    const buyer_asset_string = await this.ReadAsset(ctx, buyer_id);
    let seller_asset = JSON.parse(seller_asset_string);
    let buyer_asset = JSON.parse(buyer_asset_string);
    console.log("seller_asset");
    console.log(seller_asset);
    console.log("buyer_asset");
    console.log(buyer_asset);
    let seller_balance = parseInt(seller_asset["Balance"].toString());
    let buyer_balance = parseInt(buyer_asset["Balance"].toString());
    let transfer_amount = parseInt(amount);
    let updated_seller_balance = seller_balance - transfer_amount;
    let updated_buyer_balance = buyer_balance + transfer_amount;
    if (updated_seller_balance < 0) {
      throw new Error(`The user ${seller_id} does not have sufficient balance`);
    } else {
      await this.UpdateAsset(
        ctx,
        seller_id,
        updated_seller_balance,
        "Sold Energy"
      );
      await this.UpdateAsset(
        ctx,
        buyer_id,
        updated_buyer_balance,
        "Purchased Energy"
      );
    }
  }

  // TransferAsset updates the owner field of asset with given id in the world state.
  async BuyEnergy(ctx, seller_id, buyer_id, amount, power_to_transact) {
    const seller_asset_string = await this.ReadAsset(ctx, seller_id);
    const buyer_asset_string = await this.ReadAsset(ctx, buyer_id);
    let seller_asset = JSON.parse(seller_asset_string);
    let buyer_asset = JSON.parse(buyer_asset_string);
    console.log("seller_asset");
    console.log(seller_asset);
    console.log("buyer_asset");
    console.log(buyer_asset);

    let seller_balance = parseInt(
      seller_asset["Total_Energy_Token"].toString()
    );
    let buyer_balance = parseInt(buyer_asset["Total_Energy_Token"].toString());
    let transfer_amount = parseInt(amount);
    let updated_seller_balance = seller_balance - transfer_amount;
    let updated_buyer_balance = buyer_balance + transfer_amount;

    let seller_capacity = parseInt(seller_asset["User_Capacity"].toString());
    let buyer_capacity = parseInt(buyer_asset["User_Capacity"].toString());
    let transfer_power = parseInt(power_to_transact);
    let updated_seller_capacity = seller_capacity - transfer_power;
    let updated_buyer_capacity = buyer_capacity + transfer_power;

    if (updated_seller_balance < 0) {
      throw new Error(`The user ${seller_id} does not have sufficient balance`);
    } else if (updated_seller_capacity < 0) {
      throw new Error(
        `The user ${seller_id} does not have sufficient power capacity`
      );
    } else {
      let FromUserJSONAsset = {
        //ID: user_name+String(smart_meter_id),
        ID: seller_id,
        //User_Name: user_name,
        User_Capacity: updated_seller_capacity,
        Total_Energy_Sold:
          parseInt(seller_asset["Total_Energy_Sold"].toString()) +
          power_to_transact,
        Total_Energy_Token: updated_seller_balance,
        Transaction_From: seller_id,
        Transaction_Reason: "Energy Sold",
        Transaction_Invoke_Timestamp: moment().toISOString(),
      };

      let ToUserJSONAsset = {
        //ID: user_name+String(smart_meter_id),
        ID: buyer_id,
        //User_Name: user_name,
        User_Capacity: updated_buyer_capacity,
        Total_Energy_Purchased:
          parseInt(seller_asset["Total_Energy_Purchased"].toString()) +
          power_to_transact,
        Total_Energy_Token: updated_buyer_balance,
        Transaction_From: buyer_id,
        Transaction_Reason: "Energy Purchased",
        Transaction_Invoke_Timestamp: moment().toISOString(),
      };

      await this.UpdateAsset(ctx, seller_id, FromUserJSONAsset);
      await this.UpdateAsset(ctx, buyer_id, ToUserJSONAsset);
    }
  }

  // GetAssetHistory returns the chain of custody for an asset since issuance.
  async GetAssetHistory(ctx, assetName) {
    let resultsIterator = await ctx.stub.getHistoryForKey(assetName);
    let results = await this.GetAllResults(resultsIterator, true);

    return JSON.stringify(results);
  }

  // GetAllAssets returns all assets found in the world state.
  async GetAllAssets(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push({ Key: result.value.key, Record: record });
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  async GetAllResults(iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }
}

module.exports = UserChaincode;
