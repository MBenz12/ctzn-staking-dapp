/* eslint-disable react-hooks/exhaustive-deps */
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import NftStaking from "../target/idl/nft_staking.json";
import {
  checkTokenAccounts,
  createVault,
  getRewardAddress,
  getTokenAmounts,
  toPublicKey
} from '../fixtures/lib';
import { Vault } from '../fixtures/vault';
import { Mint } from '../fixtures/mint';
import { Keypair, PublicKey } from '@solana/web3.js';

const programId = "HES9CZTGAyJvpyHaVEAVxjfSHNw1wY27eeMZJBefFKgk";

const AdminPanel = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const provider = new anchor.AnchorProvider(connection, wallet);
  anchor.setProvider(provider);
  const program = new Program(NftStaking, programId, provider);

  const [address, setAddress] = useState(
    wallet.publicKey?.toString()
  );
  const [loading, setLoading] = useState(false);

  const [vault, setVault] = useState();

  useEffect(() => {
    setAddress(wallet.publicKey?.toString());
  }, [wallet]);

  useEffect(() => {
    const createVault = async () => {
      const vaultKey = new PublicKey(process.env.NEXT_PUBLIC_VAULT_KEY);
      const mint = new Mint(
        new PublicKey(process.env.NEXT_PUBLIC_FLWR_MINT),
        null,
        program
      );
      const [ctznsPool] = await getRewardAddress(
        vaultKey,
        program,
        0
      );
      const [aliensPool] = await getRewardAddress(
        vaultKey,
        program,
        1
      );
      const [godsPool] = await getRewardAddress(
        vaultKey,
        program,
        2
      );
      const ctznsPoolAccount = await mint.getAssociatedTokenAddress(ctznsPool);
      const aliensPoolAccount = await mint.getAssociatedTokenAddress(aliensPool);
      const godsPoolAccount = await mint.getAssociatedTokenAddress(godsPool);
      setVault(new Vault(
        program,
        vaultKey,
        mint, 
        ctznsPool, 
        aliensPool, 
        godsPool, 
        ctznsPoolAccount, 
        aliensPoolAccount, 
        godsPoolAccount, 
        0,
        0,
        0
      ));
      console.log("read vault");
    }
    if (process.env.NEXT_PUBLIC_VAULT_KEY && process.env.NEXT_PUBLIC_FLWR_MINT) createVault();
  }, []);

  // useEffect(() => {
  //   if (!address) return;


  // }, [address]);

  const handleCreateVaultClick = async () => {
    const { vault } = await createVault(program);
    setVault(vault);
    console.log("vault key", vault.key.toString());
    alert("created successfully! vault key: ", vault.key.toString());
  }

  const handleFundClick = async() => {
    const { mint } = vault;
    const authority = Keypair.fromSecretKey(
      bs58.decode(
        process.env.NEXT_PUBLIC_VAULT_OWNER_SECRECT_KEY
      )
    );
    
    const funder = Keypair.fromSecretKey(
      bs58.decode(
        process.env.NEXT_PUBLIC_FUNDER_SECRET_KEY
      )
    );
    const funderAccount = await mint.getAssociatedTokenAddress(
      funder.publicKey
    );

    if (await checkTokenAccounts(program, funder.publicKey, funderAccount) === false) {
      await mint.createAssociatedAccount(funder.publicKey);
    }

    const amount = await getTokenAmounts(program, funder.publicKey, funderAccount);
    console.log(amount);
    // const amount = new anchor.BN("1000000");
    await vault.fund({ 
      authority, 
      funder, 
      funderAccount: toPublicKey(funderAccount),
      amount: new anchor.BN(amount)
    });
  }

  return (
    <>
      {address && <div>
        <div className="fixed inset-0 flex items-center justify-center flex-col gap-5">

          <button
            type="button"
            onClick={handleCreateVaultClick}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Create Vault
          </button>

          <button
            type="button"
            onClick={handleFundClick}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Fund
          </button>
        </div>
      </div>}
    </>
  );
};

export default AdminPanel;