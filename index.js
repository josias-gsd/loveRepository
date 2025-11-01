import express from "express";
import RouterNota from "./Routers/router.js";

import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", RouterNota);

app.listen(3000, () => console.log("Servidor Voando 🚀"));
