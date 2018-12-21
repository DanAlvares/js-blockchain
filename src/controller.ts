import { Request, Response } from 'express';
import { Blockchain } from './blockchain';

import * as request from 'request-promise';
import * as UUID from 'uuid/v1';

const blockchain = new Blockchain();
const nodeAddress = UUID().replace(/-/g, '');

export const getBlockchain = (req: Request, res: Response) => {
  res.send(blockchain);
};

export const createNewTransaction = (req: Request, res: Response) => {
  const newTransaction = req.body;
  const blockIndex = blockchain.addToPendingTransactions(newTransaction);

  res.json({
    message: `The transaction will be added to block ${blockIndex}.`
  });
};

export const broadcastTransaction = async (req: Request, res: Response) => {
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

  await Promise.all(requestPromises);

  res.json({
    message: 'Transaction created and broadcast successfully'
  });
};

export const mineNewBlock = async (req: Request, res: Response) => {
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

  await Promise.all(requestPromises);

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
};

export const registerAndBroadcastNode = async (req: Request, res: Response) => {
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

  await Promise.all(regNodesPromises);

  const bulkRegisterOptions = {
    uri: newNodeUrl + '/api/register-multiple-nodes',
    method: 'POST',
    body: { allNodes: [...blockchain.networkNodes, blockchain.currentNodeUrl] },
    json: true
  };

  await request(bulkRegisterOptions);

  res.json({
    message: 'New node registered on network successfully'
  });
};

export const registerNode = (req: Request, res: Response) => {
  const newNodeUrl = req.body.newNodeUrl;
  const isCurrentNode = blockchain.currentNodeUrl === newNodeUrl;

  if (blockchain.networkNodes.indexOf(newNodeUrl) === -1 && !isCurrentNode) {
    blockchain.networkNodes.push(newNodeUrl);
  }

  res.json({
    message: 'New node registered successfully'
  });
};

export const registerMultipleNodes = (req: Request, res: Response) => {
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

export const receiveNewBlock = (req: Request, res: Response) => {
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
  } else {
    res.json({
      message: 'New block rejected',
      block: newBlock
    });
  }
};

export const consensus = async (req: Request, res: Response) => {
  const requestPromises = blockchain.networkNodes.map(nodeUrl => {
    const requestOptions = {
      uri: nodeUrl + '/api/blockchain',
      method: 'GET',
      json: true
    };

    return request(requestOptions);
  });

  const blockchains = await Promise.all(requestPromises);
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
  } else {
    blockchain.chain = newLongestChain;
    blockchain.pendingTransactions = newPendingTransactions;

    res.json({
      message: 'This chain has been replaced',
      chain: blockchain.chain
    });
  }
};
