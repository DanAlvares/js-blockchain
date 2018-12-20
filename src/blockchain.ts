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
}
