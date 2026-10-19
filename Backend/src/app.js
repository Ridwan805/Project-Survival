import express from "express";
import companyRouter from "./routes/company.route.js";
import shipHeadRouter from "./routes/ship_head.route.js";
//new add
import companyManagerRouter from "./routes/company_manager.route.js";

const app = express();

// REQUIRED: allows Express to read JSON sent from Postman
app.use(express.json());

// Mount the routes
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/ship-heads", shipHeadRouter);
//new add
app.use("/api/v1/company-managers", companyManagerRouter);


// Simple root check
app.get("/", (req, res) => {
  res.send("OceanBridge API is running.");
});


export default app; 

