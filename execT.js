// await ver.
const util = require("util");
const exec = util.promisify(require("child_process").exec);

var myArgs = process.argv.slice(2);
console.log("myArgs: ", myArgs);

async function main() {
   const { stdout, stderr } = await exec("ls | grep js");

   if (stderr) {
      console.error(`error: ${stderr}`);
   }
   console.log(`Number of files ${stdout}`);
}

main();
