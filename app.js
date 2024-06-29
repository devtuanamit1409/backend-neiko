import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
  });

app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});
