/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

let SUCCESS_CODE = 200;
let FAILURE_CODE = 500;

export async function InitLedger(ctx) {
  let return_value = {};
  return_value["status"] = SUCCESS_CODE;
  try {
    const assets = [];
    for (const asset of assets) {
      asset.docType = "asset";
      await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
      console.info(`Asset ${asset.ID} initialized`);
      return_value["message"] = `Asset ${asset.ID} initialized successfully`;
    }
  } catch (error) {
    return_value["status"] = FAILURE_CODE;
    return_value["message"] = `Failed to evaluate transaction: ${error}`;
  } finally {
    return return_value;
  }
}

// CreateAsset issues a new asset to the world state with given details.
export async function CreateAssetJson(ctx, assetJSON) {
  let return_value = {};
  return_value["status"] = SUCCESS_CODE;

  try {
    // Parse json object
    const assets = JSON.parse(assetJSON);
    // If array of objects, loop through them
    if (Array.isArray(assets)) {
      for (const asset of assets) {
        await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${asset.ID} initialized`);
      }
      return_value["message"] = `${assets.length} Assets created successfully`;
      console.info(return_value["message"]);
    } else {
      await ctx.stub.putState(assets.ID, Buffer.from(JSON.stringify(assets)));
      return_value["message"] = `Asset ${assets.ID} created successfully`;
      console.info(return_value["message"]);
    }
  } catch (error) {
    return_value["status"] = FAILURE_CODE;
    return_value["message"] = `Failed to create Asset: ${error}`;
  } finally {
    return return_value;
  }
}
// DeleteAsset deletes an given asset from the world state.
export async function DeleteAsset(ctx, id) {
  let return_value = {};
  return_value["status"] = SUCCESS_CODE;

  try {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      return_value["status"] = FAILURE_CODE;
      return_value["message"] = `The asset ${id} does not exist`;
    } else {
      return_value["message"] = ctx.stub.deleteState(id);
    }
  } catch (error) {
    return_value["status"] = FAILURE_CODE;
    return_value["message"] = `Failed to Delete Asset: ${error}`;
  } finally {
    return return_value;
  }
}
// UpdateAsset updates an existing asset in the world state with provided parameters.
export async function UpdateAssetJson(ctx, id, updateParamsJSON) {
  let return_value = {};
  return_value["status"] = SUCCESS_CODE;

  try {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      return_value["status"] = FAILURE_CODE;
      return_value["message"] = `The asset ${id} does not exist`;
    } else {
      return_value["message"] = ctx.stub.putState(
        id,
        Buffer.from(JSON.stringify(updateParamsJSON))
      );
    }
  } catch (error) {
    return_value["status"] = FAILURE_CODE;
    return_value["message"] = `Failed to Update Asset: ${error}`;
  } finally {
    return return_value;
  }
}

// AssetExists returns true when asset with given ID exists in world state.
export async function AssetExists(ctx, id) {
  const assetJSON = await ctx.stub.getState(id);
  return assetJSON && assetJSON.length > 0;
}

// GetAsset returns the asset stored in the world state with given id.
export async function GetAsset(ctx, id) {
  const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
  if (!assetJSON || assetJSON.length === 0) {
    throw new Error(`The asset ${id} does not exist`);
  }
  return assetJSON;
}
// GetQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
export async function GetQueryResultForQueryString(ctx, queryString) {
  let resultsIterator = await ctx.stub.getQueryResult(queryString);
  let results = await this.GetAllResults(resultsIterator, false);

  return JSON.stringify(results);
}

// Example: Ad hoc rich query
// QueryAssets uses a query string to perform a query for assets.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the QueryAssetsForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
export async function QueryAssets(ctx, queryString) {
  return await this.GetQueryResultForQueryString(ctx, queryString);
}

// Example: Pagination with Range Query
// GetAssetsByRangeWithPagination performs a range query based on the start & end key,
// page size and a bookmark.
// The number of fetched records will be equal to or lesser than the page size.
// Paginated range queries are only valid for read only transactions.
export async function GetAssetsByRangeWithPagination(
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
  const results = await this.GetAllResults(iterator, false);
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
export async function QueryAssetsWithPagination(
  ctx,
  queryString,
  pageSize,
  bookmark
) {
  const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
    queryString,
    pageSize,
    bookmark
  );
  console.log("iterator");
  console.log(iterator);
  console.log("metadata");
  console.log(JSON.stringify(metadata));
  const results = await this.GetAllResults(iterator, false);
  const final_output = {};
  final_output["RecordsCount"] = metadata.fetchedRecordsCount;
  final_output["Bookmark"] = metadata.bookmark;
  final_output["RecordsData"] = results;
  console.log("final_output");
  console.log(JSON.stringify(final_output));
  return JSON.stringify(final_output);
}
// GetAssetHistory returns the chain of custody for an asset since issuance.
export async function GetAssetHistory(ctx, assetId) {
  let resultsIterator = await ctx.stub.getHistoryForKey(assetId);
  let results = await this.GetAllResults(resultsIterator, true);

  return JSON.stringify(results);
}

// GetAllAssets returns all assets found in the world state.
export async function GetAllAssets(ctx) {
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

export async function GetAllResults(iterator, isHistory) {
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
