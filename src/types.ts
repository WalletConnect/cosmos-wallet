export interface ICosmosWalletOptions {
  derivationPath?: string;
  randomBytesFunc?: IRandomBytesFunc;
  keystore?: IKeyStore;
  seed?: string;
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

export type IRandomBytesFunc = (size: number) => string;

export interface IWalletJson {
  privateKey: string;
  publicKey: string;
  address: string;
}
