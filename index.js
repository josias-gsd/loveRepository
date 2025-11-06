import express from "express";
import cors from "cors";

import RouterNota from "./Routers/router.js";

const app = express();

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://josiasaby.netlify.app"); // ou "http://localhost:5173"
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});
app.use(express.json());

app.use("/", RouterNota);

app.listen(9002, () => console.log("Servidor Voando 🚀"));
