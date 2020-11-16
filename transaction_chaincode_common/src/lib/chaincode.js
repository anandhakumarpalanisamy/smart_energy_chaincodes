/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
const { AssetUtil } = require("../../../common/assetUtil");

class TransactionChaincodeCommon extends Contract {
  async InitLedger(ctx) {
    return AssetUtil.InitLedger(ctx);
  }
  async CreateAssetJson(ctx, assetJSON) {
    return AssetUtil.CreateAssetJson(ctx, assetJSON);
  }
  async DeleteAsset(ctx, id) {
    return AssetUtil.DeleteAsset(ctx, id);
  }
  async UpdateAssetJson(ctx, id, updateParamsJSON) {
    return AssetUtil.UpdateAssetJson(ctx, id, updateParamsJSON);
  }
  async AssetExists(ctx, id) {
    return AssetUtil.AssetExists(ctx, id);
  }
  async GetAsset(ctx, id) {
    return AssetUtil.GetAsset(ctx, id);
  }
  async GetQueryResultForQueryString(ctx, queryString) {
    return AssetUtil.GetQueryResultForQueryString(ctx, queryString);
  }
  async QueryAssets(ctx, queryString) {
    return AssetUtil.QueryAssets(ctx, queryString);
  }
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
  async QueryAssetsWithPagination(ctx, queryString, pageSize, bookmark) {
    return AssetUtil.QueryAssetsWithPagination(
      ctx,
      queryString,
      pageSize,
      bookmark
    );
  }
  async GetAllAssets(ctx) {
    return AssetUtil.GetAllAssets(ctx);
  }
  async GetAssetHistory(ctx, assetId) {
    return AssetUtil.GetAssetHistory(ctx, assetId);
  }
  // TransferAsset updates the owner field of asset with given id in the world state.
  async BuyEnergy(ctx, seller_id, buyer_id, amount) {
    const seller_asset_string = await AssetUtil.GetAsset(ctx, seller_id);
    const buyer_asset_string = await AssetUtil.GetAsset(ctx, buyer_id);
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
      seller_asset["Balance"] = updated_seller_balance;
      buyer_asset["Balance"] = updated_buyer_balance;
      await AssetUtil.UpdateAssetJson(ctx, seller_id, seller_asset);
      await AssetUtil.UpdateAssetJson(ctx, buyer_id, buyer_asset);
    }
  }
}

module.exports = TransactionChaincodeCommon;
