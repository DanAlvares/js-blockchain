"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sha256 = require("sha256");
const UUID = require("uuid/v1");
const currentNodeUrl = process.argv[3];
class Blockchain {
    constructor() {
        this.chain = [];
        this.currentNodeUrl = currentNodeUrl;
        this.pendingTransactions = [];
        this.networkNodes = [];
        this.createNewBlock(100, '0', '0');
    }
    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce,
            hash,
            previousBlockHash
        };
        this.pendingTransactions = [];
        this.chain.push(newBlock);
        return newBlock;
    }
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
    createNewTransaction(amount, sender, recipient) {
        const transactionId = UUID().replace(/-/g, '');
        return { amount, sender, recipient, transactionId };
    }
    addToPendingTransactions(transaction) {
        this.pendingTransactions.push(transaction);
        return Number(this.getLastBlock()['index']) + 1;
    }
    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const dataString = previousBlockHash + nonce + JSON.stringify(currentBlockData);
        return sha256(dataString);
    }
    proofOfWork(previousBlockHash, currentBlockData) {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        while (hash.substring(0, 4) !== '0000') {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }
        return nonce;
    }
    chainIsValid(blockchain) {
        let validChain = true;
        for (let i = 1, chainLen = blockchain.length; i < chainLen; i++) {
            const currentBlock = blockchain[i];
            const { transactions, index, nonce } = currentBlock;
            const previousBlock = blockchain[i - 1];
            const blockHash = this.hashBlock(previousBlock.hash, JSON.stringify({ transactions, index }), nonce);
            if (blockHash.substring(0, 4) !== '0000' || previousBlock.hash !== currentBlock.previousBlockHash)
                validChain = false;
        }
        const genesisBlock = blockchain[0];
        const correctNonce = genesisBlock.nonce === 100;
        const correctHash = genesisBlock.hash === '0';
        const correctPreviousHash = genesisBlock.previousBlockHash === '0';
        const correctTransactions = genesisBlock.transactions.length === 0;
        if (!correctNonce || !correctHash || !correctPreviousHash || !correctTransactions)
            validChain = false;
        return validChain;
    }
}
exports.Blockchain = Blockchain;
