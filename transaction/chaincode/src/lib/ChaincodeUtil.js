/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const AssetUtil = require("./AssetUtil");
const moment = require("moment");

function validateEnergyTransaction(
  advertisementData,
  sellerUserData,
  buyerUserData,
  energy_to_buy
) {
  let returnValue = {};
  returnValue["status"] = AssetUtil.SUCCESS_CODE;
  let total_cost =
    parseInt(advertisementData["Price"].toString()) *
    parseInt(energy_to_buy.toString());
  if (
    parseInt(advertisementData["Energy_to_Sell"].toString()) < energy_to_buy
  ) {
    returnValue["status"] = AssetUtil.FAILURE_CODE;
    returnValue["message"] =
      "Advertisement does not have sufficient energy to sell";
  } else {
    if (
      parseInt(sellerUserData["Energy_Produced"].toString()) < energy_to_buy
    ) {
      returnValue["status"] = AssetUtil.FAILURE_CODE;
      returnValue["message"] = "Seller does not have sufficient energy";
    } else {
      if (
        parseInt(buyerUserData["Battery_Capacity"].toString()) - energy_to_buy <
        0
      ) {
        returnValue["status"] = AssetUtil.FAILURE_CODE;
        returnValue["message"] =
          "Buyer does not have sufficient Battery Capacity";
      } else {
        if (
          parseInt(buyerUserData["Energy_Token_Balance"].toString()) -
            total_cost <
          0
        ) {
          returnValue["status"] = AssetUtil.FAILURE_CODE;
          returnValue["message"] =
            "Buyer does not have sufficient Token Balance";
        } else {
          returnValue["status"] = AssetUtil.SUCCESS_CODE;
          returnValue["message"] = "All Valid for Transaction";
        }
      }
    }
  }
  return returnValue;
}

async function buyEnergy(ctx, assetJSON) {
  let returnValue = {};
  returnValue["status"] = AssetUtil.SUCCESS_CODE;
  try {
    console.log("Inside buyEnergy");
    // Parse json object
    const buyEnergyJson = JSON.parse(assetJSON);

    console.log("buyEnergyJson");
    console.log(buyEnergyJson);

    let advertisement_id = buyEnergyJson["Advertisement_Id"];
    let seller_user_id = buyEnergyJson["Seller_User_Id"];
    let buyer_user_id = buyEnergyJson["Buyer_User_Id"];
    let energy_to_buy = buyEnergyJson["Energy_To_Buy"];

    // Get Advertisement Asset from User Chaincode
    console.log("invoking user chaincode to get seller user data");
    let getAdvertisementAssetArgs = ["GetAsset", advertisement_id];
    const getAdvertisementAsset = await ctx.stub.invokeChaincode(
      "advertisement",
      getAdvertisementAssetArgs,
      "appchannel"
    );

    // Get Seller User Asset from User Chaincode
    console.log("invoking user chaincode to get seller user data");
    let getSellerUserAssetArgs = ["GetAsset", seller_user_id];
    const getSellerUserAsset = await ctx.stub.invokeChaincode(
      "user",
      getSellerUserAssetArgs,
      "appchannel"
    );

    // Get Buyer User Asset from User Chaincode
    console.log("invoking user chaincode to get buyer user data");
    let getBuyerUserAssetArgs = ["GetAsset", buyer_user_id];
    const getBuyerUserAsset = await ctx.stub.invokeChaincode(
      "user",
      getBuyerUserAssetArgs,
      "appchannel"
    );

    if (
      (getAdvertisementAsset["status"] =
        200 &&
        getSellerUserAsset["status"] == 200 &&
        getBuyerUserAsset["status"] == 200)
    ) {
      console.log("getAdvertisementAsset");
      console.log(getAdvertisementAsset);
      let advertisementData = JSON.parse(
        getAdvertisementAsset["payload"].toString("utf8")
      );
      console.log("advertisementData");
      console.log(advertisementData);
      let sellerUserData = JSON.parse(
        getSellerUserAsset["payload"].toString("utf8")
      );
      console.log("sellerUserData");
      console.log(sellerUserData);
      let buyerUserData = JSON.parse(
        getBuyerUserAsset["payload"].toString("utf8")
      );
      console.log("buyerUserData");
      console.log(buyerUserData);

      let validateEnergyTransactionStatus = validateEnergyTransaction(
        advertisementData,
        sellerUserData,
        buyerUserData,
        energy_to_buy
      );
      console.log("validateEnergyTransactionStatus");
      console.log(validateEnergyTransactionStatus);

      if (validateEnergyTransactionStatus["status"] == AssetUtil.SUCCESS_CODE) {
        // Create Transaction
        let current_timestamp = moment().unix();
        let transaction_id =
          String(seller_user_id) +
          String(buyer_user_id) +
          String(current_timestamp);

        console.log(
          "creating new asset for the Transaction " + String(transaction_id)
        );
        let createTransactionAssetStatus = await AssetUtil.CreateAssetJson(
          ctx,
          transaction_id,
          assetJSON,
          "Created Transaction with id " + String(transaction_id)
        );
        console.log("createTransactionAssetStatus");
        console.log(createTransactionAssetStatus);

        // Update "Seller User Data" field in User Chaincode
        sellerUserData["Total_Energy_Sold"] =
          parseInt(sellerUserData["Total_Energy_Sold"].toString()) +
          parseInt(buyEnergyJson["Energy_To_Buy"].toString());

        sellerUserData["Energy_Token_Balance"] =
          parseInt(sellerUserData["Energy_Token_Balance"].toString()) +
          parseInt(total_cost.toString());

        sellerUserData["Battery_Capacity"] =
          parseInt(sellerUserData["Battery_Capacity"].toString()) -
          parseInt(buyEnergyJson["Energy_To_Buy"].toString());

        let updateSellerUserAssetArgs = [
          "UpdateAssetJson",
          seller_user_id,
          JSON.stringify(sellerUserData),
          "Sold Energy to " +
            String(buyer_user_id) +
            " - Energy Transaction Id : " +
            String(transaction_id),
        ];
        console.log("calling  user chaincode to update seller user asset");
        console.log("updateSellerUserAssetArgs");
        console.log(updateSellerUserAssetArgs);
        const updateSellerUserAsset = await ctx.stub.invokeChaincode(
          "user",
          updateSellerUserAssetArgs,
          "appchannel"
        );

        if (updateSellerUserAsset["status"] == 200) {
          let updateSelletUserAssetStatusData = updateSellerUserAsset[
            "payload"
          ].toString("utf8");
          console.log("updateSelletUserAssetStatusData");
          console.log(updateSelletUserAssetStatusData);
        } else {
          returnValue["status"] = AssetUtil.FAILURE_CODE;
          returnValue[
            "message"
          ] = `Transaction Chaincode - Failed to get update Seller User Asset`;
        }

        // Update "Buyer User Data" field in User Chaincode
        buyerUserData["Total_Energy_Purchased"] =
          parseInt(buyerUserData["Total_Energy_Purchased"].toString()) +
          parseInt(buyEnergyJson["Energy_To_Buy"].toString());

        buyerUserData["Energy_Token_Balance"] =
          parseInt(buyerUserData["Energy_Token_Balance"].toString()) -
          parseInt(total_cost.toString());

        buyerUserData["Battery_Capacity"] =
          parseInt(buyerUserData["Battery_Capacity"].toString()) +
          parseInt(buyEnergyJson["Energy_To_Buy"].toString());

        let updateBuyerUserAssetArgs = [
          "UpdateAssetJson",
          buyer_user_id,
          JSON.stringify(buyerUserData),
          "Purchased Energy from " +
            String(seller_user_id) +
            " - Energy Transaction Id : " +
            String(transaction_id),
        ];
        console.log("calling  user chaincode to update buyer user asset");
        console.log("updateBuyerUserAssetArgs");
        console.log(updateBuyerUserAssetArgs);
        const updateBuyerUserAsset = await ctx.stub.invokeChaincode(
          "user",
          updateBuyerUserAssetArgs,
          "appchannel"
        );

        if (updateBuyerUserAsset["status"] == 200) {
          let updateBuyerUserAssetStatusData = updateBuyerUserAsset[
            "payload"
          ].toString("utf8");
          console.log("updateBuyerUserAssetStatusData");
          console.log(updateBuyerUserAssetStatusData);
        } else {
          returnValue["status"] = AssetUtil.FAILURE_CODE;
          returnValue[
            "message"
          ] = `Transaction Chaincode - Failed to get update Buyer User Asset`;
        }

        // Update Advertisement Chaincode
        advertisementData["Energy_Sold"] =
          parseInt(advertisementData["Energy_Sold"].toString()) +
          parseInt(buyEnergyJson["Energy_To_Buy"].toString());

        advertisementData["Energy_Remaining"] =
          parseInt(advertisementData["Energy_Remaining"].toString()) -
          parseInt(buyEnergyJson["Energy_To_Buy"].toString());

        advertisementData["Number_of_Purchases"] =
          parseInt(advertisementData["Number_of_Purchases"].toString()) + 1;

        let updateAdvertisementAssetArgs = [
          "UpdateAssetJson",
          advertisement_id,
          JSON.stringify(advertisementData),
          "Energy Transaction : " +
            " Transaction Id : " +
            String(transaction_id) +
            " Seller : " +
            String(seller_user_id) +
            " Buyer : " +
            String(buyer_user_id),
        ];
        console.log(
          "calling  advertisement chaincode to update advertisement asset " +
            String(advertisement_id)
        );
        console.log("updateAdvertisementAssetArgs");
        console.log(updateAdvertisementAssetArgs);
        const updateAdvertisementrAsset = await ctx.stub.invokeChaincode(
          "advertisement",
          updateAdvertisementAssetArgs,
          "appchannel"
        );

        if (updateAdvertisementrAsset["status"] == 200) {
          let updateAdvertisementAssetStatusData = updateAdvertisementrAsset[
            "payload"
          ].toString("utf8");
          console.log("updateAdvertisementAssetStatusData");
          console.log(updateAdvertisementAssetStatusData);
        } else {
          returnValue["status"] = AssetUtil.FAILURE_CODE;
          returnValue[
            "message"
          ] = `Transaction Chaincode - Failed to Update Advertisement Chaincode`;
        }

        // Updates Finished
      } else {
        returnValue["status"] = AssetUtil.FAILURE_CODE;
        returnValue["message"] = validateEnergyTransactionStatus["message"];
      }
    } else {
      returnValue["status"] = AssetUtil.FAILURE_CODE;
      returnValue[
        "message"
      ] = `Transaction Chaincode - Failed to get User/Advertisement Assets`;
    }
  } catch (error) {
    returnValue["status"] = AssetUtil.FAILURE_CODE;
    returnValue[
      "message"
    ] = `Transaction Chaincode - buyEnergy Failed: ${error}`;
  } finally {
    return returnValue;
  }
}

module.exports = {
  buyEnergy: buyEnergy,
};
