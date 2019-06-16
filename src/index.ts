import { ICosmosWalletOptions, IRandomBytesFunc, IKeyStore } from "./types";
import * as utils from "./utils";
import { DEFAULT_DERIVATION_PATH } from "./defaults";

class CosmosWallet {
  public derivationPath: string;
  public randomBytesFunc: IRandomBytesFunc;
  public keystore: IKeyStore;
  public password: string;

  constructor(opts: ICosmosWalletOptions) {
    this.derivationPath = opts.derivationPath || DEFAULT_DERIVATION_PATH;
    this.randomBytesFunc =
      opts.randomBytesFunc || utils.standardRandomBytesFunc;

    if (!opts.password) {
      throw new Error("Password is required");
    }

    if (!opts.name) {
      throw new Error("Name is required");
    }

    if (opts.keystore && opts.password) {
      const check = utils.testPassword(opts.keystore, opts.password);
      if (!check) {
        throw new Error("Keystore password is incorrect");
      }
    }

    if (opts.keystore && opts.seed) {
      throw new Error("Can't generate wallet with both keystore and seed");
    }

    this.password = opts.password;

    this.keystore =
      opts.keystore ||
      (opts.seed
        ? utils.importWalletFromSeed(
            opts.name,
            this.password,
            opts.seed,
            this.derivationPath
          )
        : utils.createNewWallet(
            opts.name,
            this.password,
            this.derivationPath,
            this.randomBytesFunc
          ));
  }

  sign(message: string) {
    const walletJson = utils.openKeystore(this.keystore, this.password);
    const signature = utils.signWithPrivateKey(message, walletJson.privateKey);
    return signature;
  }
}

export default CosmosWallet;
