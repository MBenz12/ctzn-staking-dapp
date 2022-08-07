import styles from '../styles/Home.module.css'
import { useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import MetaplexProvider from '../context/MetaplexProvider';
import ShowNFTs from '../components/ShowNFTs';

export default function Home() {
  // const handleChange = (event) => {
  //   switch (event.target.value) {
  //     case "devnet":
  //       setNetwork(WalletAdapterNetwork.Devnet);
  //       break;
  //     case "mainnet":
  //       setNetwork(WalletAdapterNetwork.Mainnet);
  //       break;
  //     case "testnet":
  //       setNetwork(WalletAdapterNetwork.Testnet);
  //       break;
  //     default:
  //       setNetwork(WalletAdapterNetwork.Devnet);
  //       break;
  //   }
  // };
  const [network] = useState(WalletAdapterNetwork.Devnet);
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.App}>
                <div className="z-50">
                  <WalletMultiButton />
                </div>
                {<ShowNFTs />}
              </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}