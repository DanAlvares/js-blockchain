import { Router } from 'express';
import {
  broadcastTransaction,
  createNewTransaction,
  consensus,
  getAddress,
  getBlock,
  getBlockchain,
  getTransaction,
  mineNewBlock,
  receiveNewBlock,
  registerAndBroadcastNode,
  registerNode,
  registerMultipleNodes
} from './controller';

export function BlockchainRoutes(router: Router) {
  router.get('/mine', mineNewBlock);
  router.get('/blockchain', getBlockchain);
  router.post('/transactions', createNewTransaction);
  router.post('/transactions/broadcast', broadcastTransaction);
  router.post('/register-node', registerNode);
  router.post('/register-and-broadcast-node', registerAndBroadcastNode);
  router.post('/register-multiple-nodes', registerMultipleNodes);
  router.post('/receive-new-block', receiveNewBlock);
  router.get('/consensus', consensus);

  router.get('/block/:blockHash', getBlock);
  router.get('/transaction/:transactionId', getTransaction);
  router.get('/address/:address', getAddress);
}
