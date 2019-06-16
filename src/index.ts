import { ICosmosWalletOptions, IRandomBytesFunc, IKeyStore } from "./types";
import * as utils from "./utils";
import { DEFAULT_DERIVATION_PATH } from "./defaults";

class CosmosWallet {
  public derivationPath: string;
  public randomBytesFunc: IRandomBytesFunc;
  public keystore: IKeyStore;

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

    this.keystore =
      opts.keystore ||
      (opts.seed
        ? utils.importWalletFromSeed(
            opts.name,
            opts.password,
            opts.seed,
            this.derivationPath
          )
        : utils.createNewWallet(
            opts.name,
            opts.password,
            this.derivationPath,
            this.randomBytesFunc
          ));
  }
}

export default CosmosWallet;
