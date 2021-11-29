const fs = require("fs");
const client = require("tensorflow-serving-node-client")(
   "localhost:8502/v1/models/mnist:predict"
);

const IMAGE_PATH = "./test_image.jpg";
const buffer = fs.readFileSync(IMAGE_PATH);

client.predict(buffer, (err, res) => {
   if (err) {
      return console.error(err);
   }

   console.log(res);
});
