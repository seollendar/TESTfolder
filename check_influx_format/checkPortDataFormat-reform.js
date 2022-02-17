const fieldDataType = require("./container_field_datatype.json");
const iQuery = require("./influx");
const fs = require("fs");
const { DateTime } = require("luxon");

async function getAllAEContainer() {
   const sql = "show series";
   const result = await iQuery(sql);

   const processed = result.map((index) => {
      let [ae, container] = index.key.split(",");
      container = container.replace("container=", "");

      return { ae, container };
   });

   return processed;
}

async function getRow({ ae, container }) {
   const sql = `select * from ${ae} where "container"='${container}' limit 1`;

   const [result] = await iQuery(sql);
   return result;
}

async function main() {
   // 1. influxdb에서 모든 ae와 container 세트를 가져온다.
   const aeContainerList = await getAllAEContainer();
   const allAeContainerSetCount = aeContainerList.length;

   // 2. 모든 ae와 container 별로 데이터 row를 가져와서 타입을 비교한다.
   let i = 1;
   const log = [];
   const noDataLog = [];
   for (let index of aeContainerList) {
      const row = await getRow({ ae: index.ae, container: index.container });
      //  console.log(row);
      if (row) {
         switch (row.container) {
            case "location":
               for (let key in row) {
                  if (
                     fieldDataType.location[key] === undefined ||
                     fieldDataType.location[key] == null
                  ) {
                     log.push(
                        `${index.ae} - ${index.container} - ${key} - more exist`
                     );
                  } else if (typeof row[key] != fieldDataType.location[key]) {
                     log.push(
                        `${index.ae} - ${index.container} - ${key} = ${
                           row[key]
                        } : ${typeof row[key]} != ${
                           fieldDataType.location[key]
                        }: correct type`
                     );
                  } else if (row[key] === " ") {
                     log.push(
                        `${index.ae} - ${index.container} - ${key} - " " exist`
                     );
                  }
               }
               log.push("==========");
               break;
            // case "wearable_location":
            //    for (let key in fieldDataType.wearable_location) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.wearable_location[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.wearable_location[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "location_power":
            //    for (let key in fieldDataType.location_power) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.location_power[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.location_power[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "taco":
            //    for (let key in fieldDataType.taco) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (typeof row[key] != fieldDataType.taco[key]) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.taco[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "wearable_user":
            //    for (let key in fieldDataType.wearable_user) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.wearable_user[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.wearable_user[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "wearable_hr":
            //    for (let key in fieldDataType.wearable_hr) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.wearable_hr[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.wearable_hr[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "wearable_power":
            //    for (let key in fieldDataType.wearable_power) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.wearable_power[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.wearable_power[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "cctv_ptz":
            //    for (let key in fieldDataType.cctv_ptz) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (typeof row[key] != fieldDataType.cctv_ptz[key]) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.cctv_ptz[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "tc_spreader":
            //    for (let key in fieldDataType.tc_spreader) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.tc_spreader[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.tc_spreader[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "qc_spreader":
            //    for (let key in fieldDataType.qc_spreader) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.qc_spreader[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.qc_spreader[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "cctv_veh_container":
            //    for (let key in fieldDataType.cctv_veh_container) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.cctv_veh_container[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.cctv_veh_container[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "cctv_waiting":
            //    for (let key in fieldDataType.cctv_waiting) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.cctv_waiting[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.cctv_waiting[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "chassis":
            //    for (let key in fieldDataType.chassis) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (typeof row[key] != fieldDataType.chassis[key]) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.chassis[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "cctv_gate":
            //    for (let key in fieldDataType.cctv_gate) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (typeof row[key] != fieldDataType.cctv_gate[key]) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.cctv_gate[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "heartbeat":
            //    for (let key in fieldDataType.heartbeat) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (typeof row[key] != fieldDataType.heartbeat[key]) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.heartbeat[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "fota":
            //    for (let key in fieldDataType.fota) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (typeof row[key] != fieldDataType.fota[key]) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.fota[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
            // case "device_version":
            //    for (let key in fieldDataType.device_version) {
            //       if (row[key] === undefined || row[key] == null) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - not exist`
            //          );
            //       } else if (
            //          typeof row[key] != fieldDataType.device_version[key]
            //       ) {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} = ${
            //                row[key]
            //             } : ${typeof row[key]} != ${
            //                fieldDataType.device_version[key]
            //             }: correct type`
            //          );
            //       } else if (row[key] === " ") {
            //          log.push(
            //             `${index.ae} - ${index.container} - ${key} - " " exist`
            //          );
            //       }
            //    }
            //    log.push("==========");
            //    break;
         }
      } else {
         noDataLog.push(`AE but no data ${index.ae}, ${index.container}`);
      }

      //console.log(`${(i / allAeContainerSetCount) * 100}%`);
      console.log(`${i} / ${allAeContainerSetCount}`);
      i++;
   }

   fs.writeFile(
      `log_${DateTime.now().toFormat("yyyy-MM-dd")}.txt`,
      log.join("\r\n"),
      function (err) {
         if (err) return console.log(err);
         console.log("Completed write log file");
      }
   );

   fs.writeFile(
      `noDataLog_${DateTime.now().toFormat("yyyy-MM-dd")}.txt`,
      noDataLog.join("\r\n"),
      function (err) {
         if (err) return console.log(err);
         console.log("Completed write log file");
      }
   );
}
main();
