export interface Block {
  index: Number;
  timestamp: Number;
  transactions: Transaction[];
  nonce: Number;
  hash: String;
  previousBlockHash: String;
}

export interface Transaction {
  amount: Number;
  sender: String;
  recipient: String;
}
