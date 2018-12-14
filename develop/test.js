const Blockchain = require('./blockchain');

const litecoin = new Blockchain();
const sender = 'JKDHFSHJKSFDG34C34FGGC9YN3';
const recipient = 'ICYUDFHJ3487CVFGFWEF23RC2NFSD';
const previousBlockHash = '938J9JEY9MNCKJDFNGK78R';
const currentBlockData = [
    { amount: 10, sender, recipient },
    { amount: 20, sender, recipient },
    { amount: 50, sender, recipient }
];

// Test Genesis block
// Test createNewBlock
litecoin.createNewBlock(1234, '938J9JEY9MNCR', 'VNIRE3434CRGF');

// Test createNewTransaction
litecoin.createNewBlock(1234, '78HEWGEFG3C24', '4837YUCON873Y');
litecoin.createNewTransaction(100, sender, recipient);
litecoin.createNewTransaction(200, sender, recipient);
litecoin.createNewTransaction(500, sender, recipient);
litecoin.createNewBlock(23453456, 'XK8347YNC43Y', 'BVGHLNIUEH34I');

// Test hashBlock
litecoin.hashBlock(previousBlockHash, currentBlockData, 1234);

// Test proof of work
const proofOfWork = litecoin.proofOfWork(previousBlockHash, currentBlockData);
litecoin.hashBlock(previousBlockHash, currentBlockData, proofOfWork);

console.log(litecoin.hashBlock(previousBlockHash, currentBlockData, proofOfWork))