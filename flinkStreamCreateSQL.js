const DOName = "DO1";
const sensorList = ["S1", "S2", "S3"];
const config = { kafkaHosts: "localhost:9092" };
// Create DO Table
let createStreamSQL = {
   statement: ``,
};

if (sensorList.length == 1) {
   createStreamSQL.statement = `CREATE TABLE ${DOName}(\`sensor_id\` STRING,\`sensor_value\` STRING, \`rowtime\` TIMESTAMP(3)) WITH ('connector' = 'kafka', 'topic' = 'DO_${DOName}','properties.bootstrap.servers' = '${config.kafkaHosts}', 'format'='json')`;
} else {
   createStreamSQL.statement = `CREATE TABLE ${DOName} (tmpA BIGINT, `;

   for (i = 1; i <= sensorList.length; i++) {
      createStreamSQL.statement += `sensor${i}_id STRING, sensor${i}_value BIGINT, sensor${i}_rowtime TIMESTAMP(3), `;
   }

   createStreamSQL.statement += `PRIMARY KEY (tmpA) NOT ENFORCED) WITH('connector' = 'upsert-kafka', 'topic' = 'DO_${DOName}','properties.bootstrap.servers' = '${config.kafkaHosts}', 'key.format' = 'json', 'value.format' = 'json')`;
}

console.log("createStreamSQL: ", createStreamSQL);
