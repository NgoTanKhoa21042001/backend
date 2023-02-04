const app = require("./app");
const path = require("path");
const dotenv = require("dotenv");
require("./config/database");
const port = process.env.PORT || 9000;

if (process.env.NODE_ENV === "PRODUCTION") {
  dotenv.config({ path: ".env" });
}

const server = app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
