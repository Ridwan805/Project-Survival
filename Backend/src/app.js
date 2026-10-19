import express from "express";
import routes from "./routes/ship_head.routes.js";

const app = express();

app.use(express.json());

app.use("/api/heads", routes);

export default app; 

