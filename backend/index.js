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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
