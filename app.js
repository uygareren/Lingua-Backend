const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const authRouter = require("./router/Auth");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Running 12 3!");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});
