import { Coin, pubkeyToAddress, pubkeyType } from '@cosmjs/amino';
import {
  ExtendedSecp256k1Signature,
  Secp256k1,
  Secp256k1Signature,
} from '@cosmjs/crypto';
import { fromHex, toBase64, toHex, fromBase64 } from '@cosmjs/encoding';
import {
  AccountData,
  makeAuthInfoBytes,
  makeSignDoc,
} from '@cosmjs/proto-signing';
import Long from 'long';
import { COSMOS_ADDRESS_PREFIX } from '../constants';

export function getCosmosAddressPrefix(chainId?: string) {
  let prefix = 'cosmos';
  if (typeof chainId !== 'undefined') {
    const [namespace, reference] = chainId.split(':');
    if (namespace !== 'cosmos') {
      throw new Error(
        `Cannot get address with incompatible namespace for chainId: ${chainId}`
      );
    }
    const [name] = reference.split('-');
    if (typeof name !== 'undefined') {
      const match = COSMOS_ADDRESS_PREFIX[name];
      if (typeof match !== 'undefined') {
        prefix = match;
      }
    }
  }
  return prefix;
}

export function getCosmosAddress(publicKey: Uint8Array, chainId?: string) {
  const prefix = getCosmosAddressPrefix(chainId);
  return getAddressFromPublicKey(publicKey, prefix);
}

export function getAddressFromPublicKey(
  publicKey: Uint8Array,
  prefix = 'cosmos'
) {
  // assume for now only secp256k1
  const pubKey = { type: pubkeyType.secp256k1, value: toBase64(publicKey) };
  return pubkeyToAddress(pubKey, prefix);
}

export async function getPublicKey(privkey: Uint8Array) {
  const uncompressed = (await Secp256k1.makeKeypair(privkey)).pubkey;
  return Secp256k1.compressPubkey(uncompressed);
}

export function stringifySignDocValues(signDoc: any) {
  return {
    ...signDoc,
    bodyBytes: toHex(signDoc.bodyBytes),
    authInfoBytes: toHex(signDoc.authInfoBytes),
    accountNumber: signDoc.accountNumber.toString(16),
  };
}

export function parseSignDocValues(signDoc: any) {
  return {
    ...signDoc,
    bodyBytes: fromHex(signDoc.bodyBytes),
    authInfoBytes: fromHex(signDoc.authInfoBytes),
    accountNumber: new Long(signDoc.accountNumber),
  };
}

export function formatDirectSignDoc(
  fee: Coin[],
  pubkey: string,
  gasLimit: number,
  accountNumber: number,
  sequence: number,
  bodyBytes: string,
  chainId: string
) {
  const authInfoBytes = makeAuthInfoBytes(
    [pubkey as any],
    fee,
    gasLimit,
    sequence
  );
  const signDoc = makeSignDoc(
    fromHex(bodyBytes),
    authInfoBytes,
    chainId,
    accountNumber
  );
  return signDoc;
}

export function stringifyAccountDataValues(account: AccountData) {
  return { ...account, pubkey: toHex(account.pubkey) };
}

export function parseAccountDataValues(account: any) {
  return { ...account, pubkey: fromHex(account.pubkey) };
}

export async function recoverSigningAddress(
  signature: string,
  hash: Uint8Array,
  recoveryIndex: number
): Promise<string | null> {
  if (recoveryIndex > 3) {
    throw new Error('Invalid recovery index');
  }

  const sig = Secp256k1Signature.fromFixedLength(fromBase64(signature));
  const extendedSig = new ExtendedSecp256k1Signature(
    sig.r(),
    sig.s(),
    recoveryIndex
  );
  try {
    const recoveredPubKey = await Secp256k1.recoverPubkey(extendedSig, hash);
    return pubkeyToAddress(
      {
        type: 'tendermint/PubKeySecp256k1',
        value: toBase64(Secp256k1.compressPubkey(recoveredPubKey)),
      },
      'cosmos'
    );
  } catch {
    return null;
  }
}

export async function verifyCosmosSignature(
  address: string,
  signature: string,
  hash: Uint8Array
): Promise<boolean> {
  for (let i = 0; i < 4; i++) {
    const recoveredAddress = await recoverSigningAddress(signature, hash, i);
    if (recoveredAddress === address) {
      return true;
    }
  }

  return false;
}
