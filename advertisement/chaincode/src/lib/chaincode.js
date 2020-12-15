/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { Contract } = require("fabric-contract-api");
const AssetUtil = require("./AssetUtil");

let SUCCESS_CODE = 200;
let FAILURE_CODE = 500;

class AdvertisementChaincode extends Contract {
  async InitLedger(ctx) {
    let initialAsset = [];
    return AssetUtil.CreateAssetJson(ctx, JSON.stringify(initialAsset));
  }

  // CreateAsset issues a new asset to the world state with given details.
  async CreateAssetJson(ctx, assetJSON) {
    return AssetUtil.CreateAssetJson(ctx, assetJSON);
  }

  // ReadAsset returns the asset stored in the world state with given id.
  async GetAsset(ctx, id) {
    return AssetUtil.GetAsset(ctx, id);
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  async UpdateAsset(ctx, updateParamsJSON) {
    return AssetUtil.UpdateAsset(ctx, updateParamsJSON);
  }

  // DeleteAsset deletes an given asset from the world state.
  async DeleteAsset(ctx, id) {
    return AssetUtil.DeleteAsset(ctx, id);
  }

  // AssetExists returns true when asset with given ID exists in world state.
  async AssetExists(ctx, id) {
    return AssetUtil.AssetExists(ctx, id);
  }

  // GetAsset returns the asset stored in the world state with given id.
  async GetAsset(ctx, id) {
    return AssetUtil.GetAsset(ctx, id);
  }

  // GetQueryResultForQueryString executes the passed in query string.
  // Result set is built and returned as a byte array containing the JSON results.
  async GetQueryResultForQueryString(ctx, queryString) {
    return AssetUtil.GetQueryResultForQueryString(ctx, queryString);
  }

  // Example: Ad hoc rich query
  // QueryAssets uses a query string to perform a query for assets.
  // Query string matching state database syntax is passed in and executed as is.
  // Supports ad hoc queries that can be defined at runtime by the client.
  // If this is not desired, follow the QueryAssetsForOwner example for parameterized queries.
  // Only available on state databases that support rich query (e.g. CouchDB)
  async QueryAssets(ctx, queryString) {
    return await this.GetQueryResultForQueryString(ctx, queryString);
  }

  // Example: Pagination with Range Query
  // GetAssetsByRangeWithPagination performs a range query based on the start & end key,
  // page size and a bookmark.
  // The number of fetched records will be equal to or lesser than the page size.
  // Paginated range queries are only valid for read only transactions.
  async GetAssetsByRangeWithPagination(
    ctx,
    startKey,
    endKey,
    pageSize,
    bookmark
  ) {
    return AssetUtil.GetAssetsByRangeWithPagination(
      ctx,
      startKey,
      endKey,
      pageSize,
      bookmark
    );
  }
  // Example: Pagination with Ad hoc Rich Query
  // QueryAssetsWithPagination uses a query string, page size and a bookmark to perform a query
  // for assets. Query string matching state database syntax is passed in and executed as is.
  // The number of fetched records would be equal to or lesser than the specified page size.
  // Supports ad hoc queries that can be defined at runtime by the client.
  // If this is not desired, follow the QueryAssetsForOwner example for parameterized queries.
  // Only available on state databases that support rich query (e.g. CouchDB)
  // Paginated queries are only valid for read only transactions.
  async QueryAssetsWithPagination(ctx, queryString, pageSize, bookmark) {
    return AssetUtil.QueryAssetsWithPagination(
      ctx,
      queryString,
      pageSize,
      bookmark
    );
  }
  // GetAssetHistory returns the chain of custody for an asset since issuance.
  async GetAssetHistory(ctx, assetId) {
    return AssetUtil.GetAssetHistory(ctx, assetId);
  }

  // GetAllAssets returns all assets found in the world state.
  async GetAllAssets(ctx) {
    return AssetUtil.GetAllAssets(ctx);
  }

  async createAdvertisement(ctx, assetJSON) {
    let returnValue = {};
    returnValue["status"] = SUCCESS_CODE;
    try {
      // Parse json object
      const advertisementAssetJson = JSON.parse(assetJSON);

      // Get User Asset from User Chaincode
      let getUserAssetArgs = ["GetAsset", advertisementAssetJson["User_Id"]];
      const getUserAsset = await ctx.stub.invokeChaincode(
        "user",
        getUserAssetArgs,
        "appchannel"
      );

      if (getUserAsset["status"] == 200) {
        let userData = JSON.parse(getUserAsset["payload"].toString("utf8"));
        console.log("userData");
        console.log(userData);

        // Create advertisement asset
        let createAdvertisementAssetStatus = await this.CreateAssetJson(
          ctx,
          assetJSON
        );
        console.log("createAdvertisementAssetStatus");
        console.log(createAdvertisementAssetStatus);

        // Update "Energy_Advertised" field in User Chaincode

        console.log("increamenting energy advertised");
        console.log("userData['Energy_Advertised']");
        console.log(userData["Energy_Advertised"]);
        console.log("advertisementAssetJson['Energy_to_Sell']");
        console.log(advertisementAssetJson["Energy_to_Sell"]);
        userData["Energy_Advertised"] =
          parseInt(userData["Energy_Advertised"].toString()) +
          parseInt(advertisementAssetJson["Energy_to_Sell"].toString());
        console.log("After increamenting energy advertised");

        console.log(userData);
        let updateUserAssetArgs = [
          "UpdateAssetJson",
          advertisementAssetJson["User_Id"],
          JSON.stringify(userData),
        ];
        console.log("calling to update user asset");
        console.log("updateUserAssetArgs");
        console.log(updateUserAssetArgs);
        const updateUserAsset = await ctx.stub.invokeChaincode(
          "user",
          updateUserAssetArgs,
          "appchannel"
        );

        if (updateUserAsset["status"] == 200) {
          let updateUserAssetStatusData = updateUserAsset["payload"].toString(
            "utf8"
          );
          console.log("updateUserAssetStatusData");
          console.log(updateUserAssetStatusData);
        } else {
          returnValue["status"] = FAILURE_CODE;
          returnValue[
            "message"
          ] = `Advertisement Chaincode - Failed to get update "Energy_Advertised" in user asset`;
        }
      } else {
        returnValue["status"] = FAILURE_CODE;
        returnValue[
          "message"
        ] = `Advertisement Chaincode - Failed to get User Asset`;
      }
    } catch (error) {
      returnValue["status"] = FAILURE_CODE;
      returnValue[
        "message"
      ] = `Advertisement Chaincode - createAdvertisement Failed: ${error}`;
    } finally {
      return returnValue;
    }
  }
}

module.exports = AdvertisementChaincode;
