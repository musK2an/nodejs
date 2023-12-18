import mongoose from "mongoose";
import envconfig from "./envConfig.js";
mongoose
  .connect(
    envconfig.DB_URL
  )
  .then(() => {
    console.log(`Database Connected`);
  })
  .catch((error) => {
    console.log(`Error to connect database`,error);
  });