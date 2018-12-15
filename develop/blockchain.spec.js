const Blockchain = require('./blockchain');

describe('Blockchain', () => {
  let litecoin;
  const sender = 'JKDHFSHJKSFDG34C34FGGC9YN3';
  const recipient = 'ICYUDFHJ3487CVFGFWEF23RC2NFSD';
  const previousBlockHash = '938J9JEY9MNCKJDFNGK78R';
  const blockHash = 'LKSJDHFGN873O8G87SSD';
  const currentBlockData = [{ amount: 10, sender, recipient }, { amount: 20, sender, recipient }, { amount: 50, sender, recipient }];

  beforeEach(() => {
    litecoin = new Blockchain();
  });

  test('should create the GENESIS Block', () => {
    expect(litecoin.chain.length).toBe(1);
  });

  test('should create a NEW BLOCK', () => {
    litecoin.createNewBlock(1234, 'SKJFHGN9F7GYK', 'KJFDGO87FSDKG');
    litecoin.createNewBlock(2345, 'NKSDJFHGI73I4', 'DKJFHG8BSDFOG');
    litecoin.createNewBlock(3456, 'NFHS837BDGHFB', 'KJSDFHGVDFFDG');

    expect(litecoin.chain.length).toBe(4);
    expect(litecoin.chain[litecoin.chain.length - 1].index).toBe(4);
  });

  test('should create a NEW TRANSACTION', () => {
    litecoin.createNewBlock(1234, '78HEWGEFG3C24', '4837YUCON873Y');
    litecoin.createNewTransaction(100, sender, recipient);
    litecoin.createNewTransaction(200, sender, recipient);
    litecoin.createNewTransaction(500, sender, recipient);
    litecoin.createNewBlock(23453456, 'XK8347YNC43Y', 'BVGHLNIUEH34I');

    expect(litecoin.chain[0].transactions.length).toBe(0);
    expect(litecoin.chain[2].transactions.length).toBe(3);
  });

  test('should hash the block', () => {
    const expectedHashOne = 'afa9a6bc0397af47a2b2bb6e6471a28abb48f1e40b0533201b08b42216e9b0b0';
    const expectedHashTwo = '4882fa2dce404f4fe63a7ffc6ca46295358156eff00ee33c6e217599a0cf86e6';

    expect(litecoin.hashBlock(previousBlockHash, currentBlockData, 1234)).toBe(expectedHashOne);
    expect(litecoin.hashBlock(previousBlockHash, currentBlockData, 4321)).toBe(expectedHashTwo);
  });

  test('should verify the Block with a hash of 4 zeros', () => {
    const proofOfWork = litecoin.proofOfWork(previousBlockHash, currentBlockData);
    const verifiedOutput = litecoin.hashBlock(previousBlockHash, currentBlockData, proofOfWork);
    expect(verifiedOutput.substr(0, 4)).toBe('0000');
  });
});
