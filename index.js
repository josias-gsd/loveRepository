import express from "express";
import cors from "cors";

import RouterNota from "./Routers/router.js";

const app = express();

app.use(
  cors({
    origin: "https://josiasaby.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.json());

app.use("/", RouterNota);

app.listen(9002, () => console.log("Servidor Voando 🚀"));
//new