const sha256 = require('sha256');

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        // Genesis block
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
        this.pendingTransactions.push({ amount, sender, recipient });
        return this.getLastBlock()['index'] + 1;
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
}

module.exports = Blockchain;