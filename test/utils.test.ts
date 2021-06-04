import { fromHex } from '@cosmjs/encoding';

import {
  getCosmosAddressPrefix,
  getCosmosAddress,
  getAddressFromPublicKey,
  getPublicKey,
} from '../src';

import {
  TEST_COSMOS_CHAIN_ID,
  TEST_COSMOS_ADDRESS,
  TEST_COSMOS_KEYPAIR,
} from './shared';

describe('Utils', () => {
  it('getCosmosAddressPrefix', async () => {
    expect(getCosmosAddressPrefix('cosmos:cosmoshub-4')).toEqual('cosmos');
    expect(getCosmosAddressPrefix('cosmos:irishub-1')).toEqual('iaa');
    expect(getCosmosAddressPrefix('cosmos:kava-4')).toEqual('kava');
    expect(getCosmosAddressPrefix('cosmos:columbus-4')).toEqual('terra');
  });
  it('getCosmosAddress', async () => {
    expect(
      getCosmosAddress(
        fromHex(TEST_COSMOS_KEYPAIR.publicKey),
        TEST_COSMOS_CHAIN_ID
      )
    ).toEqual(TEST_COSMOS_ADDRESS);
  });
  it('getAddressFromPublicKey', async () => {
    expect(
      getAddressFromPublicKey(fromHex(TEST_COSMOS_KEYPAIR.publicKey))
    ).toEqual(TEST_COSMOS_ADDRESS);
  });
  it('getPublicKey', async () => {
    const publicKey = await getPublicKey(
      fromHex(TEST_COSMOS_KEYPAIR.privateKey)
    );
    expect(publicKey).toEqual(fromHex(TEST_COSMOS_KEYPAIR.publicKey));
  });
});
