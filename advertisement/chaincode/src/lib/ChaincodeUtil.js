/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const AssetUtil = require("./AssetUtil");
const moment = require("moment");

async function createAdvertisement(ctx, assetJSON) {
  let returnValue = {};
  returnValue["status"] = AssetUtil.SUCCESS_CODE;
  try {
    // Parse json object
    const advertisementAssetJson = JSON.parse(assetJSON);
    let user_id = advertisementAssetJson["User_Id"];
    let advertisement_id = advertisementAssetJson["Advertisement_Id"];

    // Get User Asset from User Chaincode

    let getUserAssetArgs = ["GetAsset", user_id];

    console.log("invoking user chaincode to get user data");
    const getUserAsset = await ctx.stub.invokeChaincode(
      "user",
      getUserAssetArgs,
      "appchannel"
    );

    if (getUserAsset["status"] == 200) {
      let userData = JSON.parse(getUserAsset["payload"].toString("utf8"));

      console.log(
        "creating new asset for the advertisement " + String(advertisement_id)
      );

      // Create Advertisement Posted Timestamp
      let currentTimestamp = moment();
      advertisementAssetJson["CreatedUnixTimestamp"] = currentTimestamp.unix();
      advertisementAssetJson[
        "CreatedIsoTimestamp"
      ] = currentTimestamp.toISOString();

      let createAdvertisementAssetStatus = await AssetUtil.CreateAssetJson(
        ctx,
        advertisement_id,
        JSON.stringify(advertisementAssetJson),
        "Created Advertisement with id " + String(advertisement_id)
      );
      console.log("createAdvertisementAssetStatus");
      console.log(createAdvertisementAssetStatus);

      // Update "Energy_Advertised" field in User Chaincode
      userData["Energy_Advertised"] =
        parseInt(userData["Energy_Advertised"].toString()) +
        parseInt(advertisementAssetJson["Energy_to_Sell"].toString());

      // Update "Energy_Advertised" field in User Chaincode
      userData["Total_Advertisements"] =
        parseInt(userData["Total_Advertisements"].toString()) + 1;

      let updateUserAssetArgs = [
        "UpdateAssetJson",
        user_id,
        JSON.stringify(userData),
        "Updated Total_Energy_Advertised after creating Advertisement Id " +
          String(advertisement_id),
      ];
      console.log("calling  user chaincode to update user asset");
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
        returnValue["status"] = AssetUtil.FAILURE_CODE;
        returnValue[
          "message"
        ] = `Advertisement Chaincode - Failed to get update "Energy_Advertised" in user asset`;
      }
    } else {
      returnValue["status"] = AssetUtil.FAILURE_CODE;
      returnValue[
        "message"
      ] = `Advertisement Chaincode - Failed to get User Asset`;
    }
  } catch (error) {
    returnValue["status"] = AssetUtil.FAILURE_CODE;
    returnValue[
      "message"
    ] = `Advertisement Chaincode - createAdvertisement Failed: ${error}`;
  } finally {
    return returnValue;
  }
}

module.exports = {
  createAdvertisement: createAdvertisement,
};
