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

// TODO - write check for database connection

const processQuery = async (query,j) => {
  const session = driver.session();

  // console.log(session);

  const start = new Date().toISOString();

  // run query
  await session
  .run(query)
  .then(result => {
    const end = new Date().toISOString();
    console.log("Success");
    etl.queries[j].start = start;
    etl.queries[j].end = end;
    etl.queries[j].status = 'Complete'
    // This is the easiest way but seems expensive in terms of keeping all of the info
    etl.queries[j].result = result;
    generateFile(file);
  })
  .catch(error => {
    const end = new Date().toISOString();
    console.log("Error");
    etl.queries[j].start = start;
    etl.queries[j].end = end;
    etl.queries[j].status = 'Error';
    // can we extract extra info regarding specifics about the error
    etl.queries[j].result = { error, message: error.message, query: query }
    generateFile(file);
  })
  .then(() => session.close())
}

const runAll = async () => {
  for (var j=0;j<queryFiles.length;j++) {
    const query = fs.readFileSync('./cypher/' + queryFiles[j].file, 'utf-8').toString();
    console.log(`Processing ${queryFiles[j].file}`);
    // refresh ui
    await processQuery(query,j);
    console.log(`Complete ${queryFiles[j].file}`);
    // refresh ui
  }
}

// Note: If you kill process while running it kills at the queries running

// on application exit:
runAll().then(() => driver.close());