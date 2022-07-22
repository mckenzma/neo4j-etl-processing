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

const processQuery = async (query,j,parameter,paramIndex) => {
  const session = driver.session();
  const start = new Date().toISOString();

  // console.log(parameter,paramIndex);

  // TODO - set query to running

  // TODO - need to set param value to replace (##SOMETHING##)

  // TODO - need to get set query status to error if apoc.periodic.iterate has error
  // at the moment it sets value as 'Success' which is incorrect

  // TODO - check if full or detla. if full always rerun

  let regex = new RegExp(/\#\#PARAM\#\#/,'g');

  // console.log(query.replace(regex,parameter));

  // run query
  await session
  // TODO pass in parameter into query
  .run(query.replace(regex,parameter))
  .then(result => {
    
    const end = new Date().toISOString();

    // console.log(Object.keys(result.records[0]._fields[7]).length === 0);
    // console.log(result.records[0]._fields[8]);
    // console.log(result.records[0]);
    // console.log(`......${parameter}`);
    if (parameter === null) {
      etl.queries[j].start = start;
      etl.queries[j].end = end;
      etl.queries[j].status = 'Complete';
      // This is the easiest way but seems expensive in terms of keeping all of the info
      // etl.queries[j].result = result;
    } else {
      // this is to catch errors when using apoc.periodic.iterate
      if (Object.keys(result.records[0]._fields[7]).length !== 0) {
        etl.queries[j].parameters[paramIndex].start = start;
        etl.queries[j].parameters[paramIndex].end = end;
        etl.queries[j].parameters[paramIndex].status = 'Error';
        // This is the easiest way but seems expensive in terms of keeping all of the info
        // etl.queries[j].parameters[paramIndex].result = result;

        delete etl.queries[j].start;
      } else {
        etl.queries[j].parameters[paramIndex].start = start;
        etl.queries[j].parameters[paramIndex].end = end;
        etl.queries[j].parameters[paramIndex].status = 'Complete';
        // This is the easiest way but seems expensive in terms of keeping all of the info
        // etl.queries[j].parameters[paramIndex].result = result;
      }

      // let flag = etl.queries[j].parameters.find(param => param.status !== 'Complete')
      // console.log(flag);
      if (queries[j].parameters.find(param => param.status !== 'Complete') === undefined) {
        etl.queries[j].status = 'Complete';
      } else if (queries[j].parameters.find(param => param.status === 'Error') !== undefined) {
        etl.queries[j].status = 'Error';
      }

      

    }

    // TODO need to check status of all parameter runs to set main query status

    generateFile(file);
    console.log("Success");
  })
  .catch(error => {
    const end = new Date().toISOString();
    etl.queries[j].start = start;
    etl.queries[j].end = end;
    etl.queries[j].status = 'Error';
    // can we extract extra info regarding specifics about the error
    // etl.queries[j].result = { error, message: error.message, query: query }
    
    // this is to remove "start", "end" from query objects that has errors in the 
    // parameter arrays. This should prob be done a different way
    if (parameter !== null) {
      delete etl.queries[j].start;
      delete etl.queries[j].end;
    }

    // TODO need to check status of all parameter runs to set main query status
    
    generateFile(file);
    console.log("Error");
  })
  .then(() => session.close())

}

const runAll = async () => {
  for (var j=0;j<queryFiles.length;j++) {
    const query = fs.readFileSync('./cypher/' + queryFiles[j].file, 'utf-8').toString();
    console.log(`Processing ${queryFiles[j].file}`);
    
    if (queryFiles[j].status !== 'Complete' && queryFiles[j].queryType === 'Full') {
      let parameters = queryFiles[j].parameters;
      let dependencyFlag = true;

      if (queryFiles[j].dependencies !== undefined) {
        console.log("Checking dependencies...");
        for (let i = 0; i < queryFiles[j].dependencies.length; i++ ) {
          let dependency = queryFiles.find(obj => obj.name === queryFiles[j].dependencies[i].name)
          if (dependency === undefined) {
            dependencyFlag = false;
          } else if (dependency.status !== 'Complete') {
            dependencyFlag = false;
          }
          // console.log(dependency);
        }
      }
      
      if (parameters === undefined) {
        if (queryFiles[j].status !== 'Complete') {
          console.log("No parameters...");
          // check if a dependency is present and complete
          if (dependencyFlag === true) {
            await processQuery(query,j,null,null);
          } else {
            console.log("Dependencies not complete. Aborting...");
          }
        }
      } else {
        console.log("Iterate over params");
        for (let i = 0; i < parameters.length; i++) {
          if (parameters[i].status !== 'Complete') {
            console.log(`Processing parameter: ${parameters[i].value}`);
            // check if a dependency is present and complete
            if (dependencyFlag === true) {
              await processQuery(query,j,parameters[i],i);
            } else {
              console.log("Dependencies not complete. Aborting...");
            }
          }
        }
      }
    }
    
    console.log('----------');

    // refresh ui
    
    console.log(`Complete ${queryFiles[j].file}`);
    // refresh ui
  }
}

// Note: If you kill process while running it kills at the queries running

// on application exit:
runAll().then(() => driver.close());