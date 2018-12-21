"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const blockchain_1 = require("./blockchain");
const request = require("request-promise");
const UUID = require("uuid/v1");
const blockchain = new blockchain_1.Blockchain();
const nodeAddress = UUID().replace(/-/g, '');
exports.getBlockchain = (req, res) => {
    res.send(blockchain);
};
exports.createNewTransaction = (req, res) => {
    const newTransaction = req.body;
    const blockIndex = blockchain.addToPendingTransactions(newTransaction);
    res.json({
        message: `The transaction will be added to block ${blockIndex}.`
    });
};
exports.broadcastTransaction = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { amount, sender, recipient } = req.body;
    const newTransaction = blockchain.createNewTransaction(amount, sender, recipient);
    const requestPromises = [];
    blockchain.addToPendingTransactions(newTransaction);
    blockchain.networkNodes.forEach(nodeUrl => {
        const requestOptions = {
            uri: nodeUrl + '/api/transactions',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(request(requestOptions));
    });
    yield Promise.all(requestPromises);
    res.json({
        message: 'Transaction created and broadcast successfully'
    });
});
exports.mineNewBlock = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const lastBlock = blockchain.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = JSON.stringify({
        transactions: blockchain.pendingTransactions,
        index: Number(lastBlock.index) + 1
    });
    const nonce = blockchain.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = blockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = blockchain.createNewBlock(nonce, previousBlockHash, blockHash);
    const requestPromises = [];
    blockchain.networkNodes.forEach(nodeUrl => {
        const requestOptions = {
            uri: nodeUrl + '/api/receive-new-block',
            method: 'POST',
            body: { newBlock },
            json: true
        };
        requestPromises.push(request(requestOptions));
    });
    yield Promise.all(requestPromises);
    // Reward this network node 10 blockchains for mining a new block
    const requestOptions = {
        uri: blockchain.currentNodeUrl + '/api/transactions/broadcast',
        method: 'POST',
        body: {
            amount: 10,
            sender: '00',
            recipient: nodeAddress
        },
        json: true
    };
    request(requestOptions);
    res.json({
        message: 'New block mined successfully!!!',
        block: newBlock
    });
});
exports.registerAndBroadcastNode = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const newNodeUrl = req.body.newNodeUrl;
    if (blockchain.networkNodes.indexOf(newNodeUrl) === -1) {
        blockchain.networkNodes.push(newNodeUrl);
    }
    const regNodesPromises = [];
    blockchain.networkNodes.forEach(nodeUrl => {
        const registerOptions = {
            uri: nodeUrl + '/api/register-node',
            method: 'POST',
            body: { newNodeUrl },
            json: true
        };
        regNodesPromises.push(request(registerOptions));
    });
    yield Promise.all(regNodesPromises);
    const bulkRegisterOptions = {
        uri: newNodeUrl + '/api/register-multiple-nodes',
        method: 'POST',
        body: { allNodes: [...blockchain.networkNodes, blockchain.currentNodeUrl] },
        json: true
    };
    yield request(bulkRegisterOptions);
    res.json({
        message: 'New node registered on network successfully'
    });
});
exports.registerNode = (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const isCurrentNode = blockchain.currentNodeUrl === newNodeUrl;
    if (blockchain.networkNodes.indexOf(newNodeUrl) === -1 && !isCurrentNode) {
        blockchain.networkNodes.push(newNodeUrl);
    }
    res.json({
        message: 'New node registered successfully'
    });
};
exports.registerMultipleNodes = (req, res) => {
    const allNetworkNodes = req.body.allNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const isCurrentNode = blockchain.currentNodeUrl === networkNodeUrl;
        if (blockchain.networkNodes.indexOf(networkNodeUrl) === -1 && !isCurrentNode) {
            blockchain.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({
        message: 'Buld registration successful'
    });
};
exports.receiveNewBlock = (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = blockchain.getLastBlock();
    // Verify block
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock.index + 1 === newBlock.index;
    if (correctHash && correctIndex) {
        blockchain.chain.push(newBlock);
        blockchain.pendingTransactions = [];
        res.json({
            message: 'New block received'
        });
    }
    else {
        res.json({
            message: 'New block rejected',
            block: newBlock
        });
    }
};
exports.consensus = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const requestPromises = blockchain.networkNodes.map(nodeUrl => {
        const requestOptions = {
            uri: nodeUrl + '/api/blockchain',
            method: 'GET',
            json: true
        };
        return request(requestOptions);
    });
    const blockchains = yield Promise.all(requestPromises);
    const currentChainLength = blockchain.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    blockchains.forEach(currentBlockchain => {
        if (currentBlockchain.chain.length > maxChainLength) {
            maxChainLength = currentBlockchain.chain.length;
            newLongestChain = currentBlockchain.chain;
            newPendingTransactions = currentBlockchain.pendingTransactions;
        }
    });
    if (!newLongestChain || (newLongestChain && !blockchain.chainIsValid(newLongestChain))) {
        res.json({
            message: 'Current chain has not been replaced',
            chain: blockchain.chain
        });
    }
    else {
        blockchain.chain = newLongestChain;
        blockchain.pendingTransactions = newPendingTransactions;
        res.json({
            message: 'This chain has been replaced',
            chain: blockchain.chain
        });
    }
});
