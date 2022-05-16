const DOName = "DO1";
const sensorList = ["S1", "S2", "S3"];
const config = { kafkaHosts: "localhost:9092" };
// Create DO Table

let insertTableSQL = {
   statement: `INSERT INTO ${DOName} select `,
};

if (sensorList.length == 1) {
   insertTableSQL.statement += `sensor_id, sensor_value, rowtime FROM ${sensor}`;
} else {
   insertTableSQL.statement += `${sensorList[0]}.tmp, `;

   for (i = 0; i < sensorList.length; i++) {
      console.log(i);
      insertTableSQL.statement += `${sensorList[i]}.sensor_id, ${sensorList[i]}.sensor_value, ${sensorList[i]}.sensor_rowtime `;
      if (i != sensorList.length - 1) {
         insertTableSQL.statement += `, `;
      } else if (i == sensorList.length - 1) {
         insertTableSQL.statement += `from  ${sensorList[0]} `;
      }
   }

   for (i = 0; i < sensorList.length - 1; i++) {
      insertTableSQL.statement += `left join ${
         sensorList[i + 1]
      } for system_time as of ${sensorList[i]}.sensor_rowtime on ${
         sensorList[i + 1]
      }.tmp=${sensorList[i]}.tmp `;
   }

   // insertTableSQL.statement += `left join ${sensorList[1]} for system_rowtime as of ${sensorList[0]}.sensor_rowtime on ${sensorList[1]}.tmp=${sensorList[0]}.tmp;`;
}

//`insert into ${DOName} select sensob.tmp, sensoa.sensor_id, sensoa.sensor_value, sensoa.sensor_rowtime, sensob.sensor_id, sensob.sensor_value, sensob.sensor_rowtime from sensob left join sensoa for system_rowtime as of sensob.sensor_rowtime on sensoa.tmp=sensob.tmp;`;

console.log("insertTableSQL: ", insertTableSQL);
