"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./controller");
function BlockchainRoutes(router) {
    router.get('/mine', controller_1.mineNewBlock);
    router.get('/blockchain', controller_1.getBlockchain);
    router.post('/transactions', controller_1.createNewTransaction);
}
exports.BlockchainRoutes = BlockchainRoutes;
