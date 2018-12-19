import { Blockchain } from '../blockchain';

describe('Blockchain', () => {
  let ninjacoin;
  const sender = 'JKDHFSHJKSFDG34C34FGGC9YN3';
  const recipient = 'ICYUDFHJ3487CVFGFWEF23RC2NFSD';
  const previousBlockHash = '938J9JEY9MNCKJDFNGK78R';
  const currentBlockData = [{ amount: 10, sender, recipient }, { amount: 20, sender, recipient }, { amount: 50, sender, recipient }];

  beforeEach(() => {
    ninjacoin = new Blockchain();
  });

  test('should create the GENESIS Block', () => {
    expect(ninjacoin.chain.length).toBe(1);
  });

  test('should create a NEW BLOCK', () => {
    ninjacoin.createNewBlock(1234, 'SKJFHGN9F7GYK', 'KJFDGO87FSDKG');
    ninjacoin.createNewBlock(2345, 'NKSDJFHGI73I4', 'DKJFHG8BSDFOG');
    ninjacoin.createNewBlock(3456, 'NFHS837BDGHFB', 'KJSDFHGVDFFDG');

    expect(ninjacoin.chain.length).toBe(4);
    expect(ninjacoin.chain[ninjacoin.chain.length - 1].index).toBe(4);
  });

  test('should create a NEW TRANSACTION', () => {
    ninjacoin.createNewBlock(1234, '78HEWGEFG3C24', '4837YUCON873Y');
    ninjacoin.createNewTransaction(100, sender, recipient);
    ninjacoin.createNewTransaction(200, sender, recipient);
    ninjacoin.createNewTransaction(500, sender, recipient);
    ninjacoin.createNewBlock(23453456, 'XK8347YNC43Y', 'BVGHLNIUEH34I');

    expect(ninjacoin.chain[0].transactions.length).toBe(0);
    expect(ninjacoin.chain[2].transactions.length).toBe(3);
  });

  test('should hash the block', () => {
    const expectedHashOne = 'afa9a6bc0397af47a2b2bb6e6471a28abb48f1e40b0533201b08b42216e9b0b0';
    const expectedHashTwo = '4882fa2dce404f4fe63a7ffc6ca46295358156eff00ee33c6e217599a0cf86e6';

    expect(ninjacoin.hashBlock(previousBlockHash, currentBlockData, 1234)).toBe(expectedHashOne);
    expect(ninjacoin.hashBlock(previousBlockHash, currentBlockData, 4321)).toBe(expectedHashTwo);
  });

  test('should verify the Block with a hash of 4 zeros', () => {
    const proofOfWork = ninjacoin.proofOfWork(previousBlockHash, currentBlockData);
    const verifiedOutput = ninjacoin.hashBlock(previousBlockHash, currentBlockData, proofOfWork);
    expect(verifiedOutput.substr(0, 4)).toBe('0000');
  });
});
