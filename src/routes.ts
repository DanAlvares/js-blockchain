import { Router } from 'express';
import { getBlockchain, mineNewBlock, createNewTransaction } from './controller';

export function BlockchainRoutes(router: Router) {
  router.get('/mine', mineNewBlock);

  router.get('/blockchain', getBlockchain);

  router.post('/transactions', createNewTransaction);
}
