import bs58 from "bs58";
import nacl from "tweetnacl";

interface SignMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;
}

export class SigninMessage {
  constructor(private readonly message: SignMessage) {}

  private prepareMessage(): Uint8Array {
    const { statement, nonce } = this.message;
    return new TextEncoder().encode(`${statement}${nonce}`);
  }

  async sign(signer: (message: Uint8Array) => Promise<Uint8Array>): Promise<string> {
    const signature = await signer(this.prepareMessage());
    return bs58.encode(signature);
  }

  async validate(signature: string): Promise<boolean> {
    const message = this.prepareMessage();
    const signatureUint8 = bs58.decode(signature);
    const pubKeyUint8 = bs58.decode(this.message.publicKey);
    return nacl.sign.detached.verify(message, signatureUint8, pubKeyUint8);
  }
}
