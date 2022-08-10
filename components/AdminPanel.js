import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import NftStaking from "../target/idl/nft_staking.json";

import { Keypair } from '@solana/web3.js';

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

  useEffect(() => {
    setAddress(wallet.publicKey?.toString());
  }, [wallet]);

  // useEffect(() => {
  //   if (!address) return;


  // }, [address]);

  const handleCreateVaultClick = async () => {
  }

  return (
    <>
      {address && <div>
        <div className="fixed inset-0 flex items-center justify-center flex-col">

          <button
            type="button"
            onClick={handleCreateVaultClick}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Create Vault
          </button>

        </div>
      </div>}
    </>
  );
};

export default AdminPanel;