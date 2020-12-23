/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const moment = require("moment");

let SUCCESS_CODE = 200;
let FAILURE_CODE = 500;

// CreateAsset issues a new asset to the world state with given details.
async function CreateAssetJson(ctx, assetId, assetJSON, TransactionMessage) {
  let returnValue = {};
  returnValue["status"] = SUCCESS_CODE;

  try {
    // Parse json object
    const assetData = JSON.parse(assetJSON);
    // If array of objects, loop through them
    if (Array.isArray(assetData)) {
      let currentTimestamp;
      for (const asset of assetData) {
        currentTimestamp = moment();
        asset["TransactionUnixTimestamp"] = currentTimestamp.unix();
        asset["TransactionIsoTimestamp"] = currentTimestamp.toISOString();
        asset["TransactionMessage"] = TransactionMessage;
        asset["AssetId"] = assetId;
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${assetId} initialized`);
      }
      returnValue["message"] = `${assets.length} Assets created successfully`;
      console.info(returnValue["message"]);
    } else {
      let currentTimestamp = moment();
      assetData["TransactionMessage"] = TransactionMessage;
      assetData["TransactionUnixTimestamp"] = currentTimestamp.unix();
      assetData["TransactionIsoTimestamp"] = currentTimestamp.toISOString();
      assetData["AssetId"] = assetId;
      await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(assetData)));
      returnValue["message"] = `Asset ${assetId} created successfully`;
      console.info(returnValue["message"]);
    }
  } catch (error) {
    returnValue["status"] = FAILURE_CODE;
    returnValue["message"] = `Failed to create Asset: ${error}`;
  } finally {
    return returnValue;
  }
}
// DeleteAsset deletes an given asset from the world state.
async function DeleteAsset(ctx, id) {
  let returnValue = {};
  returnValue["status"] = SUCCESS_CODE;

  try {
    const exists = await AssetExists(ctx, id);
    if (!exists) {
      returnValue["status"] = FAILURE_CODE;
      returnValue["message"] = `The asset ${id} does not exist`;
    } else {
      returnValue["message"] = ctx.stub.deleteState(id);
    }
  } catch (error) {
    returnValue["status"] = FAILURE_CODE;
    returnValue["message"] = `Failed to Delete Asset: ${error}`;
  } finally {
    return returnValue;
  }
}
// UpdateAsset updates an existing asset in the world state with provided parameters.
async function UpdateAssetJson(ctx, id, updateParamsJSON, TransactionMessage) {
  let returnValue = {};
  returnValue["status"] = SUCCESS_CODE;

  try {
    const exists = await AssetExists(ctx, id);
    if (!exists) {
      returnValue["status"] = FAILURE_CODE;
      returnValue["message"] = `The asset ${id} does not exist`;
    } else {
      let currentAsset = JSON.parse(await GetAsset(ctx, id));
      let updateParams = JSON.parse(updateParamsJSON);
      let updatedAsset = update_obj(currentAsset, updateParams);
      let currentTimestamp = moment();
      updatedAsset["TransactionUnixTimestamp"] = currentTimestamp.unix();
      updatedAsset["TransactionIsoTimestamp"] = currentTimestamp.toISOString();
      updatedAsset["TransactionMessage"] = TransactionMessage;
      returnValue["message"] = ctx.stub.putState(
        id,
        Buffer.from(JSON.stringify(updatedAsset))
      );
    }
  } catch (error) {
    returnValue["status"] = FAILURE_CODE;
    returnValue["message"] = `Failed to Update Asset: ${error}`;
  } finally {
    return returnValue;
  }
}

// AssetExists returns true when asset with given ID exists in world state.
async function AssetExists(ctx, id) {
  const assetJSON = await ctx.stub.getState(id);
  return assetJSON && assetJSON.length > 0;
}

// GetAsset returns the asset stored in the world state with given id.
async function GetAsset(ctx, id) {
  const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
  if (!assetJSON || assetJSON.length === 0) {
    throw new Error(`The asset ${id} does not exist`);
  }
  return assetJSON.toString();
}
// GetQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
async function GetQueryResultForQueryString(ctx, queryString) {
  let resultsIterator = await ctx.stub.getQueryResult(queryString);
  let results = await GetAllResults(resultsIterator, false);

  return JSON.stringify(results);
}

// Example: Ad hoc rich query
// QueryAssets uses a query string to perform a query for assets.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the QueryAssetsForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
async function QueryAssets(ctx, queryString) {
  return await GetQueryResultForQueryString(ctx, queryString);
}

// Example: Pagination with Range Query
// GetAssetsByRangeWithPagination performs a range query based on the start & end key,
// page size and a bookmark.
// The number of fetched records will be equal to or lesser than the page size.
// Paginated range queries are only valid for read only transactions.
async function GetAssetsByRangeWithPagination(
  ctx,
  startKey,
  endKey,
  pageSize,
  bookmark
) {
  const { iterator, metadata } = await ctx.stub.getStateByRangeWithPagination(
    startKey,
    endKey,
    pageSize,
    bookmark
  );
  console.log("iterator");
  console.log(iterator);
  console.log("metadata");
  console.log(JSON.stringify(metadata));
  const results = await GetAllResults(iterator, false);
  const final_output = {};
  final_output["RecordsCount"] = metadata.fetchedRecordsCount;
  final_output["Bookmark"] = metadata.bookmark;
  final_output["RecordsData"] = results;
  console.log("final_output");
  console.log(JSON.stringify(final_output));
  return JSON.stringify(final_output);
}
// Example: Pagination with Ad hoc Rich Query
// QueryAssetsWithPagination uses a query string, page size and a bookmark to perform a query
// for assets. Query string matching state database syntax is passed in and executed as is.
// The number of fetched records would be equal to or lesser than the specified page size.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the QueryAssetsForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
// Paginated queries are only valid for read only transactions.
async function QueryAssetsWithPagination(ctx, queryString, pageSize, bookmark) {
  let returnValue = {};
  returnValue["status"] = SUCCESS_CODE;
  const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
    queryString,
    pageSize,
    bookmark
  );
  console.log("iterator");
  console.log(iterator);
  console.log("metadata");
  console.log(JSON.stringify(metadata));
  const results = await GetAllResults(iterator, false);
  const final_output = {};
  final_output["RecordsCount"] = metadata.fetchedRecordsCount;
  final_output["Bookmark"] = metadata.bookmark;
  final_output["RecordsData"] = results;
  console.log("final_output");
  console.log(JSON.stringify(final_output));
  return JSON.stringify(final_output);
}
// GetAssetHistory returns the chain of custody for an asset since issuance.
async function GetAssetHistory(ctx, assetId) {
  let resultsIterator = await ctx.stub.getHistoryForKey(assetId);
  let results = await GetAllResults(resultsIterator, true);

  return JSON.stringify(results);
}

// GetAllAssets returns all assets found in the world state.
async function GetAllAssets(ctx) {
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

async function GetAllResults(iterator, isHistory) {
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

function update_obj(obj /*, …*/) {
  for (var i = 1; i < arguments.length; i++) {
    for (var prop in arguments[i]) {
      var val = arguments[i][prop];
      if (typeof val == "object")
        // this also applies to arrays or null!
        update(obj[prop], val);
      else obj[prop] = val;
    }
  }
  return obj;
}

module.exports = {
  SUCCESS_CODE: SUCCESS_CODE,
  FAILURE_CODE: FAILURE_CODE,
  CreateAssetJson: CreateAssetJson,
  DeleteAsset: DeleteAsset,
  UpdateAssetJson: UpdateAssetJson,
  AssetExists: AssetExists,
  GetAsset: GetAsset,
  GetQueryResultForQueryString: GetQueryResultForQueryString,
  QueryAssets: QueryAssets,
  GetAssetsByRangeWithPagination: GetAssetsByRangeWithPagination,
  QueryAssetsWithPagination: QueryAssetsWithPagination,
  GetAssetHistory: GetAssetHistory,
  GetAllAssets: GetAllAssets,
};
