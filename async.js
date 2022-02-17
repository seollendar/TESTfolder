const { setTimeout } = require("timers/promises");
console.log("Starting async operation..");
await setTimeout(1000);
console.log("Async done!");
