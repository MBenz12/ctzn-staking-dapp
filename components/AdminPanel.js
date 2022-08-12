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
  getTokenAmounts,
  getVault,
  toPublicKey
} from '../fixtures/lib';
import { Keypair } from '@solana/web3.js';

const AdminPanel = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const provider = new anchor.AnchorProvider(connection, wallet);
  anchor.setProvider(provider);
  const program = new Program(NftStaking, process.env.NEXT_PUBLIC_PROGRAM_ID, provider);

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
      setVault(await getVault(program));
    }
    createVault();
  }, []);

  // useEffect(() => {
  //   if (!address) return;


  // }, [address]);

  const handleCreateVaultClick = async () => {
    const { vault } = await createVault(program, wallet);
    setVault(vault);
    console.log("vault key", vault.key.toString());
    alert("created successfully! vault key: ", vault.key.toString());
  }

  const handleFundClick = async() => {
    const { mint } = vault;
    
    
    const funderAccount = await mint.getAssociatedTokenAddress(
      wallet.publicKey
    );

    if (await checkTokenAccounts(program, wallet.publicKey, funderAccount) === false) {
      await mint.createAssociatedAccount(wallet.publicKey);
    }

    const amount = await getTokenAmounts(program, wallet.publicKey, funderAccount);
    console.log(amount);
    // const amount = new anchor.BN("1000000");
    await vault.fund({ 
      wallet, 
      wallet, 
      funderAccount,
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