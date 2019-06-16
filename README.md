# cosmos-wallet

Configurable Wallet for Cosmos SDK Chains

## Install

```sh
npm install --save cosmos-wallet

#or

yarn add cosmos-wallet
```

## Create New Wallet

**Required Params:** password, name

```js
import CosmosWallet from('cosmos-wallet')

const wallet = new CosmosWallet({
  name: 'John Doe',
  password: 'securepassword'
})
```

## Import Keystore

**Required Params:** password, name, keystore

```js
import CosmosWallet from('cosmos-wallet')

const wallet = new CosmosWallet({
  name: 'John Doe',
  password: 'securepassword',
  keystore: <PREVIOUS_KEYSTORE>
})
```

## Import Mnemomic

**Required Params:** password, name, mnemomic

```js
import CosmosWallet from('cosmos-wallet')

const wallet = new CosmosWallet({
  name: 'John Doe',
  password: 'securepassword',
  mnemomic: 'type nerve tumble culture stumble asset control still have spoon market pepper garbage              alien actual awake guitar great mountain girl desk actual helmet risk'
})
```

## Sign Message

**Required Params:** password, name

```js
wallet.sign("some random message");

// signature
("bd527879250cdf6eec6e3c2004f926dcd07dc762201892ade4060feb3735fbc876fd4db6342509a80f200442d3347b5c5c6380b150dde7e84ef61ea36dda6060");
```

## Export Keystore

**Required Params:** password
Optional Params: name

```js
wallet.export("moresecurepassword")

// keystore

{
  name: "John Doe",
  address: "cosmos145cp9xuhscswsfztntx0e6pqskjaz37f9mqez3",
  wallet:
    "b87b31d99a076e642dfd95c52c27dc903160b7695ec70ada4f63442b6c5e6dffjIUt4msRJD4bFbD5oHmKq33Af5gC6Vm4YIBzid8KAs/1SJwbp91lx0HqbmmXtzzZBOH6DBPIM3DLXzL/er36TEC349Ds2+D9t1esCEZ3919IpRgTWyJoMWMy2OsDVgCiuXUPl/QhoTdOXalIQ73T/RIWHUuR9wJSoHEnRSUQa/gHxXhQP9bS8h2RG5JT+3oiIz91mPh1H/RFsH9xKOa5F7SXTvusIzyRKj6Sea3HIAfhP42xH29+WOczMGVdERLRov6zcNwgTzxKnNNbwOpH8SaEkWTA125yUaIPukmXpA4="
}
```

## Configuration Options

```typescript
ICosmosWalletOptions {
  derivationPath?: string;
  randomBytesFunc?: (size: number) => string;
  formatAddress?: (publicKey: Buffer) => string;
  keystore?: {
    name: string;
    address: string;
    wallet: string;
  }
  mnemomic?: string;
  password: string;
  name: string;
}
```
