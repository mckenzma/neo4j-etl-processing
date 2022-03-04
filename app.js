'use strict'

const fs = require('fs');

// import etl config file
let etl_config = fs.readFileSync('test_etl.json');
let etl = JSON.parse(etl_config);

// import config file for Month-Year of ETL run
let conf = JSON.parse(fs.readFileSync('./2021/2021_07_conf.json'));

etl.year = conf.year;
etl.month = conf.month;

// create output file name based on config file
let file_name = [conf.year,
                 conf.month < 10 ? '0' + conf.month : conf.month,
                 'etl'
                ].join('_');
file_name = file_name + '.json';

let updatedETL = {
  name: etl.name,
  year: conf.year,
  month: conf.month,
  description: etl.description,
  notes: etl.notes,
  // status: etl.status,
  processes: etl.processes
};
//updatedETL.year = conf.year;
//updatedETL.month = conf.month;

// make dir if not exists to place file
// var dir = `./${etl.year}_${etl.month < 10 ? '0' + etl.month : etl.month}`;
var dir = `./${conf.year}`;
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

// set up driver and connect

for (var i=0;i<etl.processes.length;i++){
  for (var j=0;j<etl.processes[i].steps.length;j++){
    
    // get cypher from file
    var cypher = fs.readFileSync(etl.processes[i].steps[j].file, 'utf-8');

    etl.processes[i].steps[j].query = cypher;
    // etl.processes[i].steps[j].query = cypher.split('\r\n');
    // etl.processes[i].steps[j].query = cypher.split('\n');

    // run cypher

    // collect output and metrics

    // add metrics to object

    // if error --> pause
    // else --> push object / save file

    etl.processes[i].steps[j].status = (i !== j && j === 0 ) ? "Error" : "Complete";
    etl.processes[i].steps[j].start = '2021-07-01T12:00:00.000';
    etl.processes[i].steps[j].end = '2021-07-01T13:15:30.500';
  }
}

// set status for process based on steps
for (var i=0;i<etl.processes.length;i++){
  for (var j=0;j<etl.processes[i].steps.length;j++){
    if (etl.processes[i].steps[j].status === "Complete"){
      etl.processes[i].status = "Complete";
    } else {
      etl.processes[i].status = etl.processes[i].steps[j].status;
    }
  }
}

let output = JSON.stringify(updatedETL,null,2);
// output file to directory
fs.writeFileSync(dir + '/' + file_name, output);