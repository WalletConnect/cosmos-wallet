export type IRandomBytesFunc = (size: number) => string;

export type IFormatAddressFunc = (publicKey: Buffer) => string;

export interface ICosmosWalletOptions {
  derivationPath?: string;
  randomBytesFunc?: IRandomBytesFunc;
  formatAddress?: IFormatAddressFunc;
  keystore?: IKeyStore;
  mnemomic?: string;
  password: string;
  name: string;
}

export interface IKeyPair {
  privateKey: Buffer;
  publicKey: Buffer;
}

export interface IKeyStore {
  name: string;
  address: string;
  wallet: string;
}

export interface IWalletJson {
  privateKey: string;
  publicKey: string;
  address: string;
}
