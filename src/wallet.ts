import { Secp256k1, sha256, Secp256k1Signature } from '@cosmjs/crypto';
import { fromHex, fromBase64 } from '@cosmjs/encoding';
import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  StdSignDoc,
  AminoSignResponse,
  AccountData,
} from '@cosmjs/amino';
import {
  DirectSecp256k1Wallet,
  DirectSignResponse,
  makeSignBytes,
} from '@cosmjs/proto-signing';
import { SignDoc } from '@cosmjs/proto-signing/build/codec/cosmos/tx/v1beta1/tx';

import {
  getAddressFromPublicKey,
  getPublicKey,
  ICosmosWallet,
  verifyCosmosSignature,
} from './helpers';

export class CosmosWallet implements ICosmosWallet {
  public static async init(
    privateKey: string,
    prefix = 'cosmos'
  ): Promise<CosmosWallet> {
    const privkey = fromHex(privateKey);
    const pubkey = await getPublicKey(privkey);
    const address = getAddressFromPublicKey(pubkey, prefix);
    const direct = await DirectSecp256k1Wallet.fromKey(privkey, prefix);
    return new CosmosWallet(direct, privkey, pubkey, address);
  }

  constructor(
    public direct: DirectSecp256k1Wallet,
    private privkey: Uint8Array,
    private pubkey: Uint8Array,
    private address: string
  ) {}

  public async getAccounts(): Promise<readonly AccountData[]> {
    return this.direct.getAccounts();
  }

  public async signDirect(
    address: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    return this.direct.signDirect(address, signDoc);
  }

  public async signAmino(
    address: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }
    const message = sha256(serializeSignDoc(signDoc));
    const sig = await Secp256k1.createSignature(message, this.privkey);
    const sigBytes = new Uint8Array([...sig.r(32), ...sig.s(32)]);
    const signature = encodeSecp256k1Signature(this.pubkey, sigBytes);
    return { signed: signDoc, signature };
  }

  public async verifyDirect(
    address: string,
    signature: string,
    signDoc: SignDoc
  ) {
    const messageHash = sha256(makeSignBytes(signDoc));
    return await verifyCosmosSignature(address, signature, messageHash);
  }
}

export default CosmosWallet;
