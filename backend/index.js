require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRouter");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api", userRouter);

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
