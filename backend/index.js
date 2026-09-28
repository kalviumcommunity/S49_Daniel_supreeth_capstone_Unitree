require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Add it to backend/.env");
    process.exit(1);
}

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
