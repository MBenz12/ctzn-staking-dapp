import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  Keypair,
  TransactionSignature,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import { Mint } from "./mint";
import {
  getRewardAddress,
  getUserAddress,
  getStakeAddress,
  spawnMoney,
  getBlockTime,
} from "./lib";
import { TokenAccount } from "./token-account";
import { NftStaking } from "../target/types/nft_staking";
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Transaction } from "@solana/web3.js";

const VAULT_STAKE_SEED = "vault_stake";
export class Vault {
  constructor(
    public program: anchor.Program<NftStaking>,
    public key: PublicKey,
    public mint: Mint,
    public ctznsPool: PublicKey,
    public aliensPool: PublicKey,
    public godsPool: PublicKey,
    public ctznsPoolAccount: PublicKey,
    public aliensPoolAccount: PublicKey,
    public godsPoolAccount: PublicKey,
    public ctznsPoolAmount: number,
    public aliensPoolAmount: number,
    public godsPoolAmount: number,
  ) { }

  async fetch(): Promise<VaultData | null> {
    return (await this.program.account.vault.fetchNullable(
      this.key
    )) as VaultData | null;
  }

  async fetchUser(userAddress: PublicKey): Promise<UserData | null> {
    return (await this.program.account.user.fetchNullable(
      userAddress
    )) as UserData | null;
  }

  static async create({
    authority = Keypair.generate(),
    vaultKey = Keypair.generate(),
    program,
    mint,
  }: {
    authority?: Keypair | WalletContextState;
    vaultKey?: Keypair;
    program: anchor.Program<NftStaking>;
    mint: Mint;
  }): Promise<{
    authority: Keypair | WalletContextState;
    vault: Vault;
    sig: TransactionSignature;
  }> {
    // await spawnMoney(program, authority.publicKey, 10);
    // console.log(authority.publicKey.toString());
    console.log('Creating vault...');
    const [ctznsPool, ctzns_pool_bump] = await getRewardAddress(
      vaultKey.publicKey,
      program,
      0
    );
    console.log('Ctzns reward pool address: ', ctznsPool.toString());

    const [aliensPool, aliens_pool_bump] = await getRewardAddress(
      vaultKey.publicKey,
      program,
      1
    );
    console.log('Aliens reward pool address: ', aliensPool.toString());

    const [godsPool, gods_pool_bump] = await getRewardAddress(
      vaultKey.publicKey,
      program,
      2
    );
    console.log('Gods reward pool address: ', godsPool.toString());

    const ctznsPoolAccount = await mint.getAssociatedTokenAddress(ctznsPool);
    const aliensPoolAccount = await mint.getAssociatedTokenAddress(aliensPool);
    const godsPoolAccount = await mint.getAssociatedTokenAddress(godsPool);

    let txSignature;
    if (typeof authority === typeof Keypair) {
      txSignature = await program.rpc.createVault(
        ctzns_pool_bump,
        aliens_pool_bump,
        gods_pool_bump,
        {
          accounts: {
            authority: authority.publicKey,
            vault: vaultKey.publicKey,
            rewardMint: mint.key,
            ctznsPool,
            aliensPool,
            godsPool,
            ctznsPoolAccount,
            aliensPoolAccount,
            godsPoolAccount,
            rent: SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          },
          signers: [authority as Keypair, vaultKey],
          options: {
            commitment: "confirmed"
          },
        }
      );
    } else {
      console.log('sending transation from wallet...');
      let tx = program.transaction.createVault(
        ctzns_pool_bump,
        aliens_pool_bump,
        gods_pool_bump,
        {
          accounts: {
            authority: authority.publicKey,
            vault: vaultKey.publicKey,
            rewardMint: mint.key,
            ctznsPool,
            aliensPool,
            godsPool,
            ctznsPoolAccount,
            aliensPoolAccount,
            godsPoolAccount,
            rent: SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          },
        }
      );

      txSignature = await (authority as WalletContextState).sendTransaction(tx, program.provider.connection, {
        signers: [vaultKey],
      });
      await program.provider.connection.confirmTransaction(txSignature, "confirmed");
    }


    console.log('Vault created successfully!', txSignature);
    return {
      authority,
      vault: new Vault(
        program,
        vaultKey.publicKey,
        mint,
        ctznsPool,
        aliensPool,
        godsPool,
        ctznsPoolAccount,
        aliensPoolAccount,
        godsPoolAccount,
        0,
        0,
        0,
      ),
      sig: txSignature,
    };
  }

  async createUser({
    authority = Keypair.generate(),
    userType
  }: {
    authority?: Keypair | WalletContextState,
    userType: number
  }): Promise<{
    authority: Keypair | WalletContextState;
    user: PublicKey;
    sig: TransactionSignature;
  }> {
    // await spawnMoney(this.program, authority.publicKey, 2);
    const [userAddress] = await getUserAddress(
      this.key,
      authority.publicKey,
      this.program,
      userType
    );
    let txSignature;

    if (typeof authority === typeof Keypair) {
      txSignature = await this.program.rpc.createUser(userType, {
        accounts: {
          authority: authority.publicKey,
          vault: this.key,
          user: userAddress,
          systemProgram: SystemProgram.programId,
        },
        signers: [authority as Keypair],
        options: {
          commitment: "confirmed",
        },
      });
    } else {
      let tx = await this.program.transaction.createUser(userType, {
        accounts: {
          authority: authority.publicKey,
          vault: this.key,
          user: userAddress,
          systemProgram: SystemProgram.programId,
        },
      });
      txSignature = await (authority as WalletContextState).sendTransaction(tx, this.program.provider.connection);
      await this.program.provider.connection.confirmTransaction(txSignature, "confirmed");
    }
    return {
      authority,
      user: userAddress,
      sig: txSignature,
    };
  }

  async fund({
    authority,
    funder,
    funderAccount,
    amount,
  }: {
    authority: PublicKey;
    funder: Keypair | WalletContextState;
    funderAccount: PublicKey;
    amount: anchor.BN;
  }): Promise<{
    sig: TransactionSignature;
  }> {
    let txSignature;
    if (typeof funder === typeof Keypair) {
      txSignature = await this.program.rpc.fund(amount, {
        accounts: {
          funder: funder.publicKey,
          authority,
          vault: this.key,
          ctznsPoolAccount: this.ctznsPoolAccount,
          funderAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [funder as Keypair],
        options: {
          commitment: "confirmed"
        }
      });
    } else {
      let tx = await this.program.transaction.fund(amount, {
        accounts: {
          funder: funder.publicKey,
          authority,
          vault: this.key,
          ctznsPoolAccount: this.ctznsPoolAccount,
          funderAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });
      txSignature = await (funder as WalletContextState).sendTransaction(tx, this.program.provider.connection);
      await this.program.provider.connection.confirmTransaction(txSignature, "confirmed");
    }
    return {
      sig: txSignature,
    };
  }

  async stake(
    itemType: number,
    curAuthoriy: WalletContextState,
    curUser: PublicKey,
    nft: PublicKey,
  ) {

    let txSignature;
    let tx = this.program.transaction.stake(itemType, {
      accounts: {
        staker: curAuthoriy.publicKey,
        vault: this.key,
        stakeAccount: nft,
        user: curUser,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }
    });

    txSignature = await curAuthoriy.sendTransaction(tx, this.program.provider.connection);
    await this.program.provider.connection.confirmTransaction(txSignature, "confirmed");

    // // stake
    // await this.program.rpc.stake(itemType, {
    //   accounts: {
    //     staker: userAuthority.publicKey,
    //     vault: this.key,
    //     stakeAccount: stakeAccount.key,
    //     user,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   signers: [userAuthority],
    //   options: { commitment: "confirmed" },
    // });

    // return { userAuthority: curAuthoriy, user: curUser, stakeAccount: nft, stakeMint };
  }
  /*
    async unstake(
      authority: Keypair,
      user: PublicKey,
      stakeAccount: TokenAccount<PublicKey>,
    ): Promise<boolean> {
      const [vaultPda, vaultStakeBump] = await getStakeAddress(
        this.key,
        authority.publicKey,
        stakeAccount.key,
        this.program
      );
  
      await this.program.rpc.unstake(vaultStakeBump, {
        accounts: {
          staker: authority.publicKey,
          vault: this.key,
          unstakeAccount: stakeAccount.key,
          vaultPda,
          user,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
        signers: [authority],
        options: { commitment: "confirmed" },
      });
      return true;
    }
  
    async getRewardAmount(
      user: PublicKey,
    ): Promise<number> {
      const now = await getBlockTime(this.program);
      const userData = await this.fetchUser(user);
      let total = 0;
      userData.items.forEach(item => {
        total = total + item.earnedReward.toNumber() + (now - item.lastClaimedTime.toNumber()) * 36;
        // console.log(item.lastClaimedTime.toNumber());
      });
      return total;
    }
  
    async claim(claimer: Keypair, user: PublicKey, userType: number) {
      const claimerAccount = await this.mint.getAssociatedTokenAddress(
        claimer.publicKey
      );
      const [ctznsPool] = await getRewardAddress(
        this.key,
        this.program,
        0
      );
  
      const [aliensPool] = await getRewardAddress(
        this.key,
        this.program,
        1
      );
  
      const [godsPool] = await getRewardAddress(
        this.key,
        this.program,
        2
      );
  
      const ctznsPoolAccount = await this.mint.getAssociatedTokenAddress(ctznsPool);
      const aliensPoolAccount = await this.mint.getAssociatedTokenAddress(aliensPool);
      const godsPoolAccount = await this.mint.getAssociatedTokenAddress(godsPool);
      await this.program.rpc.claim(userType, {
        accounts: {
          claimer: claimer.publicKey,
          vault: this.key,
          ctznsPool,
          aliensPool,
          godsPool,
          rewardMint: this.mint.key,
          ctznsPoolAccount,
          aliensPoolAccount,
          godsPoolAccount,
          claimerAccount,
          user,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
        signers: [claimer],
        options: { commitment: "confirmed" },
      });
    }
  
    async withdraw(claimer: Keypair, amount: anchor.BN) {
      const claimerAccount = await this.mint.getAssociatedTokenAddress(
        claimer.publicKey
      );
      const [ctznsPool] = await getRewardAddress(
        this.key,
        this.program,
        0
      );
      const ctznsPoolAccount = await this.mint.getAssociatedTokenAddress(ctznsPool);
      await this.program.rpc.withdraw(amount, {
        accounts: {
          claimer: claimer.publicKey,
          vault: this.key,
          ctznsPool,
          rewardMint: this.mint.key,
          ctznsPoolAccount,
          claimerAccount,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
        signers: [claimer],
        // options: { commitment: "confirmed" },
      });
    }*/
}

export type VaultStatus = {
  none?: {};
  initialized?: {};
};

export type VaultData = {
  authority: PublicKey;
  status: VaultStatus;
  rewardMint: PublicKey;
  ctznsPoolBump: number;
  ctznsPoolAccount: PublicKey;
  aliensPoolBump: number;
  aliensPoolAccount: PublicKey;
  godsPoolBump: number;
  godsPoolAccount: PublicKey;
  ctznsPoolAmount: anchor.BN;
  aliensPoolAmount: anchor.BN;
  godsPoolAmount: anchor.BN;
  alphaAliensCount: number;
  normalAliensCount: number;
};


export type UserData = {
  vault: PublicKey;
  key: PublicKey;
  userType: UserType;
  itemsCount: number;
  items: StakeItemData[];
};

export type ItemType = {
  normalCtzn?: {};
  normalAlien?: {};
  alphaAlien?: {};
  alienGod?: {};
};

export type UserType = {
  ctzn?: {};
  alien?: {};
};


export type StakeItemData = {
  mintAccount: PublicKey;
  itemType: ItemType;
  firstStakedTime: anchor.BN;
  lastClaimedTime: anchor.BN;
  earnedReward: anchor.BN;
}

