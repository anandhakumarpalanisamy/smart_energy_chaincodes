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
    const getUserAsset = await ctx.stub.invokeChaincode(
      "user",
      getUserAssetArgs,
      "appchannel"
    );

    if (getUserAsset["status"] == 200) {
      let userData = JSON.parse(getUserAsset["payload"].toString("utf8"));
      console.log("userData");
      console.log(userData);
      console.log("userData keys");
      console.log(Object.keys(userData));

      let createAdvertisementAssetStatus = await AssetUtil.CreateAssetJson(
        ctx,
        advertisement_id,
        assetJSON,
        "Created Advertisement with id " + String(advertisement_id)
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
        user_id,
        JSON.stringify(userData),
        "Updated Total_Energy_Advertised after creating Advertisement Id " +
          String(advertisement_id),
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
