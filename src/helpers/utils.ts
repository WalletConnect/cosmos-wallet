import { Secp256k1 } from '@cosmjs/crypto';
import { toBase64 } from '@cosmjs/encoding';
import { pubkeyToAddress, pubkeyType } from '@cosmjs/amino';

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
  const pubKey = {
    type: pubkeyType.secp256k1,
    value: toBase64(publicKey),
  };
  return pubkeyToAddress(pubKey, prefix);
}

export async function getPublicKey(privkey: Uint8Array) {
  const uncompressed = (await Secp256k1.makeKeypair(privkey)).pubkey;
  return Secp256k1.compressPubkey(uncompressed);
}
