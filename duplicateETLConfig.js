// Script to duplicate an ETL config file

// get etl file
const fs = require('fs');

var existingFile = 'etl-config.json';
var newFile = 'etl-config-new.json';

let rawData = fs.readFileSync(existingFile);
let obj = JSON.parse(rawData)

// copy pertinent info to new file
for (var i = 0; i < obj.queries.length; i++) {
  obj.queries[i] = {
    name: obj.queries[i].name,
    description: obj.queries[i].description,
    file: obj.queries[i].file,
  }
}

console.log(obj);

// generate new file
function generateFile(name) {
  fs.writeFileSync(name, JSON.stringify(obj,null,2), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + name);
    }
  })
}

generateFile(newFile);