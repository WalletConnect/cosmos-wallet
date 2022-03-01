import {
  AccountData,
  DirectSignResponse,
  OfflineDirectSigner,
} from '@cosmjs/proto-signing';
import { StdSignDoc, AminoSignResponse } from '@cosmjs/amino';
import { SignDoc } from '@cosmjs/proto-signing/build/codec/cosmos/tx/v1beta1/tx';

export abstract class ICosmosWallet implements OfflineDirectSigner {
  public abstract getAccounts(): Promise<readonly AccountData[]>;

  public abstract signDirect(
    address: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse>;

  public abstract signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse>;

  public abstract verifyDirectSignature(
    address: string,
    signature: string,
    signDoc: SignDoc
  ): Promise<boolean>;

  public abstract verifyAminoSignature(
    address: string,
    signature: string,
    signDoc: StdSignDoc
  ): Promise<boolean>;
}
