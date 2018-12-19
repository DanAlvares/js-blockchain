"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const routes_1 = require("./routes");
const app = express();
const router = express.Router();
routes_1.BlockchainRoutes(router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', router);
const port = process.argv[2] || 3000;
app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`);
});
