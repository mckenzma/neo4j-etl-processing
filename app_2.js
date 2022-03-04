console.clear();
'use strict';

// Reference link
// https://neo4j.com/docs/api/javascript-driver/current/

console.log("====================================");
console.log("====================================");

const { Console } = require('console');
const fs = require('fs');

var file = 'etl-config.json';

let rawdata = fs.readFileSync(file);
let etl = JSON.parse(rawdata);

function generateFile(name){
  fs.writeFileSync(name, JSON.stringify(etl,null,2),function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + name);
    }
  });
}

var queryFiles = etl.queries;

var neo4j = require('neo4j-driver');

console.log('Starting app...');

const driver = neo4j.driver(
  'bolt://localhost',
  neo4j.auth.basic('neo4j', 'password')
);

const asyncFunction = async (query,j) => {
    const session = driver.session();

    const start = new Date().toISOString();

    // run query
    await session
    .run(query)
    .then(result => {
      // console.log(result);

      // result.records.forEach(record => {
      //   // console.log(record);
      //   var obj = {};

      //   for(var i=0;i<record.keys.length;i++){
      //     // console.log(etl[queryFiles[j]]);
      //     obj[record.keys[i]] = record._fields[i];

      //   }
      //   // console.log(obj);
      //   // etl.queries[j].output = obj;
      // })

      const end = new Date().toISOString();
      // console.log(start,end, Date());

      // etl.queries[j].result = result;
      etl.queries[j].start = start;
      etl.queries[j].end = end;
      // etl.queries[j].status = 'Complete'
      generateFile(file);
    })
    .catch(error => {
      console.log(error)
      // etl.queries[j].status = 'Error'
      // etl.queries[j].result = error;
      // generateFile(file);
    })
    .then(() => session.close())

}

for (var j=0;j<queryFiles.length;j++) {
  // console.log(j, queryFiles[j]);
  
  // check if status says it can run
  // What are the statuses?

  // get query from file
  // var query = fs.readFileSync('./queries/' + queryFiles[j].file);
  const query = fs.readFileSync('./cypher/' + queryFiles[j].file, 'utf-8').toString();
  
  asyncFunction(query,j);
}

// on application exit:
driver.close();