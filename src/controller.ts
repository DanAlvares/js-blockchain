import { Request, Response } from 'express';
import { Blockchain } from './blockchain';
import * as UUID from 'uuid/v1';

const coin = new Blockchain();
const address = UUID().replace(/-/g, '');

export const getBlockchain = (req: Request, res: Response) => {
  res.send(coin);
};

export const createNewTransaction = (req: Request, res: Response) => {
  const { amount, sender, recipient } = req.body;
  const blockIndex = coin.createNewTransaction(amount, sender, recipient);

  res.json({
    message: `The transaction will be added in block ${blockIndex}.`
  });
};

export const mineNewBlock = (req: Request, res: Response) => {
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
