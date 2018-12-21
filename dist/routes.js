"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./controller");
function BlockchainRoutes(router) {
    router.get('/mine', controller_1.mineNewBlock);
    router.get('/blockchain', controller_1.getBlockchain);
    router.post('/transactions', controller_1.createNewTransaction);
    router.post('/transactions/broadcast', controller_1.broadcastTransaction);
    router.post('/register-node', controller_1.registerNode);
    router.post('/register-and-broadcast-node', controller_1.registerAndBroadcastNode);
    router.post('/register-multiple-nodes', controller_1.registerMultipleNodes);
    router.post('/receive-new-block', controller_1.receiveNewBlock);
    router.get('/consensus', controller_1.consensus);
    router.get('/block/:blockHash', controller_1.getBlock);
    router.get('/transaction/:transactionId', controller_1.getTransaction);
    router.get('/address/:address', controller_1.getAddress);
}
exports.BlockchainRoutes = BlockchainRoutes;
