import styles from '../styles/Home.module.css'
import { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { Metaplex } from '@metaplex-foundation/js';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';


const connection = new Connection(clusterApiUrl('mainnet-beta'));
const mx = Metaplex.make(connection);
const creator = "CUDGnANU3DEFcGEsppXwqjTD9nUFCFbBmrBUVjPfwPHb";

export const ShowNFTs = (props) => {
  const wallet = useWallet();

  const [address, setAddress] = useState(
    wallet.publicKey
  );

  const [nftList, setNftList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState(null);


  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setCurrentView(null);
      const list = await (await mx.nfts().findAllByOwner(new PublicKey(address))).filter(nft =>
        nft.creators && nft.creators[0].address.toString() === creator
      );

      setNftList(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!nftList) {
      return;
    }

    const execute = async () => {
      await loadData();
      setCurrentView(nftList);
      setLoading(false);
    };
    execute();
  }, [nftList]);

  const loadData = async () => {
    const nftsToLoad = nftList.filter((nft, index) => {
      return (
        nft.metadataTask.isPending()
      );
    });

    console.log(nftsToLoad);
    const promises = nftsToLoad.map((nft) => nft.metadataTask.run());
    await Promise.all(promises);
  };

  return wallet.connected && (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>Wallet Address</h1>
        <div className={styles.nftForm}>
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <button className={styles.styledButton} onClick={fetchNFTs}>
            Fetch
          </button>
        </div>
        {loading ? (
          <img className={styles.loadingIcon} src="/loading.svg" />
        ) : (
          currentView &&
          currentView.map((nft, index) => (
            <div key={index} className={styles.nftPreview}>
              <h1>{nft.name}</h1>
              <img
                className={styles.nftImage}
                src={nft.metadata.image || '/fallbackImage.jpg'}
                alt="The downloaded illustration of the provided NFT address."
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
