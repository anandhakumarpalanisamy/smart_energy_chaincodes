const moment = require("moment");
console.log("hello");
function add(a, b) {
  return a + b;
}
console.log(add(15, 4));

var unixTimestamp = moment("2012-07-01 00:30:00", "YYYY-MM-DD hh:mm:ss").unix();
console.log(unixTimestamp);

var human_readable = moment.unix(unixTimestamp).format("YYYY-MM-DD hh:mm:ss");
console.log(human_readable);

var now = moment().toISOString();
console.log(now);

const assets = [
  {
    ID: "demo1",
    Balance: 1000,
    Type: "Initial Credit",
  },
  {
    ID: "demo2",
    Balance: 1000,
    Type: "Initial Credit",
  },
];

let json_data = [
  {
    Timestamp: { seconds: "1604373732", nanos: 386000000 },
    Value: { ID: "ark", Balance: 80, Type: "Debit - Friendly_Help" },
  },
  {
    Timestamp: { seconds: "1604373713", nanos: 995000000 },
    Value: { ID: "ark", Balance: 90, Type: "Debit - Friendly_Help" },
  },
  {
    Timestamp: { seconds: "1603986199", nanos: 39000000 },
    Value: { ID: "ark", Balance: 100, Type: "Credit - Friendly_Help" },
  },
  {
    Timestamp: { seconds: "1603799768", nanos: 587000000 },
    Value: { ID: "ark", Balance: 67, Type: "Debit - Emergency_Help" },
  },
  {
    Timestamp: { seconds: "1603747153", nanos: 800000000 },
    Value: { ID: "ark", Balance: 72, Type: "Debit - Friendly_Help" },
  },
  {
    Timestamp: { seconds: "1603747130", nanos: 337000000 },
    Value: { ID: "ark", Balance: 90, Type: "Debit - Friendly_Help" },
  },
  {
    Timestamp: { seconds: "1603720747", nanos: 799000000 },
    Value: { ID: "ark", Balance: 95, Type: "Debit - Friendly_Help" },
  },
  {
    Timestamp: { seconds: "1603720717", nanos: 991000000 },
    Value: { ID: "ark", Balance: "100", Type: "Initial Credit" },
  },
];

function fabricHistoryTimeStampToUnix(timestamp) {
  console.log(timestamp);
  const milliseconds =
    (Number(timestamp.seconds) + Number(timestamp.nanos) / 1000000 / 1000) *
    1000;
  return new Date(milliseconds);
}

function parse_history_data(history_data) {
  let final_data_dict = [];
  let final_data = [];
  let data_dict = {};
  let merged_data = {};
  let columns = {};
  let column_keys = [];
  for (const data of history_data) {
    data_dict = {};
    merged_data = {};
    data_dict["Timestamp"] = fabricHistoryTimeStampToUnix(data["Timestamp"]);
    merged_data = Object.assign({}, data_dict, data["Value"]);
    final_data.push(Object.values(merged_data));
  }
  for (const column of Object.keys(merged_data)) {
    column_dict = {};
    column_dict["title"] = column;
    column_keys.push(column_dict);
  }
  final_data_dict["data"] = final_data;
  final_data_dict["columns"] = column_keys;
  return final_data_dict;
}
console.log(parse_history_data(json_data));

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

let test_dict = {
  id: "13",
  Name: "Anand",
  Address: "Liveien 4A",
  Phone: "91299438",
};
console.log(test_dict);
let update_dict = {
  Name: "Arun",
};
console.log(update_dict);
test_dict = update_obj(test_dict, update_dict);
console.log(test_dict);

console.log(JSON.stringify([]));
