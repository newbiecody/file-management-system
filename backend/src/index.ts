import v1Router from "./routes/v1/";
import cors from "cors";
const express = require("express");

const PORT = 4000;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

app.use("/api/v1", v1Router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
