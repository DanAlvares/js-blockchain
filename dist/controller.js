"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blockchain_1 = require("./blockchain");
const UUID = require("uuid/v1");
const coin = new blockchain_1.Blockchain();
const address = UUID().replace(/-/g, '');
exports.getBlockchain = (req, res) => {
    res.send(coin);
};
exports.createNewTransaction = (req, res) => {
    const { amount, sender, recipient } = req.body;
    const blockIndex = coin.createNewTransaction(amount, sender, recipient);
    res.json({
        message: `The transaction will be added in block ${blockIndex}.`
    });
};
exports.mineNewBlock = (req, res) => {
    const lastBlock = coin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = JSON.stringify({
        transactions: coin.pendingTransactions,
        index: Number(lastBlock.index) + 1
    });
    const nonce = coin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = coin.hashBlock(previousBlockHash, currentBlockData, nonce);
    // Reward this network node 10 coins for mining a new block
    coin.createNewTransaction(10, '00', address);
    const newBlock = coin.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        message: 'New block mined successfully!!!',
        block: newBlock
    });
};
