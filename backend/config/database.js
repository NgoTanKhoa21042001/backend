require("dotenv").config();
const mongoose = require("mongoose");

const connectionStr = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PW}@cluster0.p7xwa58.mongodb.net/doan4?retryWrites=true&w=majority`;

mongoose
  .connect(connectionStr, { useNewUrlparser: true, useUnifiedTopology: true })
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

mongoose.connection.on("error", (err) => {
  console.log(err);
});

//doan4
//6VNpoYtcECDvDKkF
