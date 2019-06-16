import sha256 from "crypto-js/sha256";
import ripemd160 from "crypto-js/ripemd160";
import CryptoJS from "crypto-js";
import bip39 from "bip39";
import { fromSeed, BIP32Interface } from "bip32";
import bech32 from "bech32";
import secp256k1 from "secp256k1";
import {
  IWalletJson,
  IRandomBytesFunc,
  IKeyPair,
  IKeyStore,
  IFormatAddressFunc
} from "./types";
import {
  PBKDF2_KEY_SIZE,
  PBKDF2_SALT_SIZE,
  PBKDF2_IV_SIZE,
  PBKDF2_ITERATIONS,
  ENTROPY_LENGTH
} from "./defaults";

export function standardRandomBytesFunc(size: number): string {
  if (typeof window !== "undefined" && typeof window.crypto !== "undefined") {
    let key = ``;
    let keyContainer = new Uint32Array(size / 4);
    keyContainer = window.crypto.getRandomValues(keyContainer);
    for (let keySegment = 0; keySegment < keyContainer.length; keySegment++) {
      key += keyContainer[keySegment].toString(16);
    }
    return key;
  } else {
    const key = CryptoJS.lib.WordArray.random(size).toString();
    return key;
  }
}

export function generateWalletFromSeed(
  mnemonic: string,
  derivationPath: string,
  formatAddress: IFormatAddressFunc
): IWalletJson {
  const masterKey = deriveMasterKey(mnemonic);
  const { privateKey, publicKey } = deriveKeypair(masterKey, derivationPath);
  const address = formatAddress(publicKey);
  const walletJson: IWalletJson = {
    privateKey: privateKey.toString(`hex`),
    publicKey: publicKey.toString(`hex`),
    address
  };
  return walletJson;
}

export function generateSeed(randomBytesFunc: IRandomBytesFunc): string {
  const randomBytes = Buffer.from(randomBytesFunc(ENTROPY_LENGTH), `hex`);
  if (randomBytes.length !== ENTROPY_LENGTH) {
    throw Error(`Entropy has incorrect length`);
  }
  const mnemonic = bip39.entropyToMnemonic(randomBytes.toString(`hex`));
  return mnemonic;
}

export function generateWallet(
  derivationPath: string,
  randomBytesFunc: IRandomBytesFunc,
  formatAddress: IFormatAddressFunc
): IWalletJson {
  const mnemonic = generateSeed(randomBytesFunc);
  const walletJson = generateWalletFromSeed(
    mnemonic,
    derivationPath,
    formatAddress
  );
  return walletJson;
}

export function createNewWallet(
  name: string,
  password: string,
  derivationPath: string,
  randomBytesFunc: IRandomBytesFunc,
  formatAddress: IFormatAddressFunc
): IKeyStore {
  const wallet = generateWallet(derivationPath, randomBytesFunc, formatAddress);
  const ciphertext = encrypt(JSON.stringify(wallet), password);
  const keystore = { name, address: wallet.address, wallet: ciphertext };
  return keystore;
}

export function importWalletFromSeed(
  name: string,
  password: string,
  seed: string,
  derivationPath: string,
  formatAddress: IFormatAddressFunc
): IKeyStore {
  const wallet = generateWalletFromSeed(seed, derivationPath, formatAddress);
  const ciphertext = encrypt(JSON.stringify(wallet), password);
  const keystore = { name, address: wallet.address, wallet: ciphertext };
  return keystore;
}

// NOTE: this only works with a compressed public key (33 bytes)
export function formatCosmosAddress(publicKey: Buffer): string {
  const message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`));
  const test: any = sha256(message);
  const hash = ripemd160(test).toString();
  const addressHash = Buffer.from(hash, `hex`);
  const address = bech32ify(addressHash, `cosmos`);
  return address;
}

export function deriveMasterKey(mnemonic: string): BIP32Interface {
  // throws if mnemonic is invalid
  bip39.validateMnemonic(mnemonic);
  const seed = bip39.mnemonicToSeed(mnemonic);
  const masterKey = fromSeed(seed);
  return masterKey;
}

export function deriveKeypair(
  masterKey: BIP32Interface,
  derivationPath: string
): IKeyPair {
  const cosmosHD = masterKey.derivePath(derivationPath);
  const privateKey = cosmosHD.privateKey || new Buffer(0);
  const publicKey = secp256k1.publicKeyCreate(privateKey, true);
  const keyPair = {
    privateKey,
    publicKey
  };
  return keyPair;
}

export function bech32ify(address: Buffer, prefix: string): string {
  const words = bech32.toWords(address);
  const bech32String = bech32.encode(prefix, words);
  return bech32String;
}

// produces the signature for a message (returns Buffer)
export function signWithPrivateKey(
  signMessage: string,
  privateKey: string
): string {
  const signHash = Buffer.from(sha256(signMessage).toString(), `hex`);
  const { signature } = secp256k1.sign(
    signHash,
    Buffer.from(privateKey, `hex`)
  );
  return signature.toString("hex");
}

// TODO needs proof reading
export function encrypt(message: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(PBKDF2_SALT_SIZE / 8);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: PBKDF2_KEY_SIZE / 32,
    iterations: PBKDF2_ITERATIONS
  });

  const iv = CryptoJS.lib.WordArray.random(PBKDF2_IV_SIZE / 8);

  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  const transit = salt.toString() + iv.toString() + encrypted.toString();
  return transit;
}

export function decrypt(transit: string, password: string): string {
  const salt = CryptoJS.enc.Hex.parse(transit.substr(0, 32));
  const iv = CryptoJS.enc.Hex.parse(transit.substr(32, 32));
  const encrypted = transit.substring(64);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: PBKDF2_KEY_SIZE / 32,
    iterations: PBKDF2_ITERATIONS
  });

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

export function testPassword(keystore: IKeyStore, password: string): boolean {
  try {
    const decrypted = decrypt(keystore.wallet, password);
    JSON.parse(decrypted);
    return true;
  } catch (err) {
    return false;
  }
}

export function openKeystore(
  keystore: IKeyStore,
  password: string
): IWalletJson {
  const decrypted = decrypt(keystore.wallet, password);
  const walletJson = JSON.parse(decrypted);
  return walletJson;
}

export function createKeystore(
  name: string,
  password: string,
  wallet: IWalletJson
): IKeyStore {
  const ciphertext = encrypt(JSON.stringify(wallet), password);
  const keystore = {
    name,
    address: wallet.address,
    wallet: ciphertext
  };
  return keystore;
}

export function verifyPassword(password: string): void {
  if (!password) {
    throw new Error("Password is required");
  }
  if (password.length < 8) {
    throw new Error("Password length is less than 8 characters");
  }
}
