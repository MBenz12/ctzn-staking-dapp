/* eslint-disable @next/next/no-img-element */
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'

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

  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.App}>
                <div className="md:h-[150px] sm:h-[100px] h-[80px] bg-black/[0.52] flex items-center">
                  <div className="flex justify-between container lg:mx-auto max-w-[940px] relative mx-[20px]">
                    <a href='#' className="flex items-center">
                      <img 
                        src='/777CTZNS_LOGO.png'
                        className="md:w-[150px] sm:w-[100px]  w-[80px]" 
                        alt=''
                      ></img>
                    </a>
                    <nav className="text-white items-center gap-10 md:flex hidden leading-[1]">
                      <a className="cursor-pointer">BUY</a>
                      <a className="cursor-pointer">WHITEPAPER</a>
                      <div>
                        <WalletMultiButton />
                      </div>
                    </nav>
                    <div className="flex items-center md:hidden relative" onClick={() => setToggleMenu(!toggleMenu)}>
                      <a className={`text-white text-[20px] leading-[0] cursor-pointer p-[10px] ${toggleMenu ? 'bg-white/[0.5]' : ''}`}>
                        <FontAwesomeIcon icon={faBars} />
                      </a>                      
                    </div>
                  </div>
                  
                </div>
                {toggleMenu && <div className="text-white items-center bg-black/[0.5] flex flex-col gap-5 leading-[1] md:hidden">
                  <a>BUY</a>
                  <a>WHITEPAPER</a>
                  <div className="mb-5">
                    <WalletMultiButton />
                  </div>
                </div>}
                <ShowNFTs />
              </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}