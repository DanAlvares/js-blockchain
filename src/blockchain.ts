import { Block, Transaction } from './interfaces';
import * as sha256 from 'sha256';
import * as UUID from 'uuid/v1';

const currentNodeUrl = process.argv[3];

export class Blockchain {
  chain: Block[] = [];
  currentNodeUrl: string = currentNodeUrl;
  pendingTransactions: Transaction[] = [];
  networkNodes = [];

  constructor() {
    this.createNewBlock(100, '0', '0');
  }

  createNewBlock(nonce: number, previousBlockHash: string, hash: string): Block {
    const newBlock: Block = {
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

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(amount: number, sender: string, recipient: string): Transaction {
    const transactionId = UUID().replace(/-/g, '');
    return { amount, sender, recipient, transactionId };
  }

  addToPendingTransactions(transaction: Transaction): number {
    this.pendingTransactions.push(transaction);
    return Number(this.getLastBlock()['index']) + 1;
  }

  hashBlock(previousBlockHash: string, currentBlockData: string, nonce: number): string {
    const dataString = previousBlockHash + nonce + JSON.stringify(currentBlockData);
    return sha256(dataString);
  }

  proofOfWork(previousBlockHash: string, currentBlockData: string): number {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
  }

  chainIsValid(blockchain: Block[]): boolean {
    let validChain = true;

    for (let i = 1, chainLen = blockchain.length; i < chainLen; i++) {
      const currentBlock = blockchain[i];
      const { transactions, index, nonce } = currentBlock;
      const previousBlock = blockchain[i - 1];
      const blockHash = this.hashBlock(previousBlock.hash, JSON.stringify({ transactions, index }), nonce);

      if (blockHash.substring(0, 4) !== '0000' || previousBlock.hash !== currentBlock.previousBlockHash) validChain = false;
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock.nonce === 100;
    const correctHash = genesisBlock.hash === '0';
    const correctPreviousHash = genesisBlock.previousBlockHash === '0';
    const correctTransactions = genesisBlock.transactions.length === 0;
    if (!correctNonce || !correctHash || !correctPreviousHash || !correctTransactions) validChain = false;

    return validChain;
  }

  getBlock(hash: string): Block {
    return this.chain.filter(block => block.hash === hash)[0];
  }

  getTransaction(transactionId: string): any {
    let correctBlock: Block;
    let correctTransaction: Transaction;

    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.transactionId === transactionId) {
          correctBlock = block;
          correctTransaction = transaction;
        }
      });
    });

    return {
      transaction: correctTransaction,
      block: correctBlock
    };
  }

  getAddress(address: string) {
    const transactions = [];
    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.sender === address || transaction.recipient === address) {
          transactions.push(transaction);
        }
      });
    });

    const balance = transactions.reduce((acc, val) => {
      if (val.sender === address) return acc - val.amount;
      if (val.recipient === address) return acc + val.amount;
    }, 0);

    return { balance, transactions };
  }
}
