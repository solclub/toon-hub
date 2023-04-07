import bs58 from "bs58";
import nacl from "tweetnacl";
type SignMessage = {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;
};

export class SigninMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;

  constructor(message: SignMessage);
  constructor(serialized: string);
  constructor(arg: SignMessage | string) {
    if (typeof arg === "string") {
      const message: SignMessage = JSON.parse(arg);
      this.domain = message.domain;
      this.publicKey = message.publicKey;
      this.nonce = message.nonce;
      this.statement = message.statement;
    } else {
      const message = arg;
      this.domain = message.domain;
      this.publicKey = message.publicKey;
      this.nonce = message.nonce;
      this.statement = message.statement;
    }
  }

  prepare() {
    return new TextEncoder().encode(`${this.statement}${this.nonce}`);
  }

  validate(signature: string) {
    const msgUint8 = this.prepare();
    const signatureUint8 = bs58.decode(signature);
    const pubKeyUint8 = bs58.decode(this.publicKey);

    return nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
  }
}
