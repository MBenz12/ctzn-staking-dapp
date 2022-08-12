/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
// import Image from 'next/image';
import { Transition, Dialog } from '@headlessui/react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import NftStaking from "../target/idl/nft_staking.json";
import { PublicKey } from '@solana/web3.js';
import useMetaplex from '../hooks/useMetaplex';
import styles from '../styles/Home.module.css'
import {
  checkTokenAccounts,
  createVault,
  getTokenAmounts,
  getVault,
  toPublicKey
} from '../fixtures/lib';

const candyMachine = "CUDGnANU3DEFcGEsppXwqjTD9nUFCFbBmrBUVjPfwPHb";
// const candyMachine = "8XrvWo4ywz6kzN7cDekmAZYyfCP8ZMQHLaaqkxFp9vhH";

const ShowNFTs = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const provider = new anchor.AnchorProvider(connection, wallet);
  anchor.setProvider(provider);
  const program = new Program(NftStaking, process.env.NEXT_PUBLIC_PROGRAM_ID, provider);

  const { metaplex } = useMetaplex();
  const [address, setAddress] = useState(
    // wallet.publicKey?.toString()
    "3qWq2ehELrVJrTg2JKKERm67cN6vYjm1EyhCEzfQ6jMd"
    // "7FKaZcmr6WRQPAqFQXYFNgF5St2RPZt8ay47hLBho84G"
    // "85tJUsy1J6TYxxCMKR24owFuMyTeKtM1eWbbcVjLtSq2"
    // "2iLBgrVgknFo53D8wrdWY86o1HEXUJsZs8mjYk8J37X2"
  );
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [ctznDialogOpen, setCtznDialogOpen] = useState(false);
  const [alienDialogOpen, setAlienDialogOpen] = useState(false);
  const [stakedCtzns, setStakedCtzns] = useState([]);
  const [stakedAliens, setStakedAliens] = useState([]);
  const [ctzns, setCtzns] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [selectedNfts, setSelectedNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vault, setVault] = useState();


  useEffect(() => {
    // setAddress(wallet.publicKey?.toString());
    setAddress("3qWq2ehELrVJrTg2JKKERm67cN6vYjm1EyhCEzfQ6jMd");
  }, [wallet]);

  useEffect(() => {
    const createVault = async () => {
      setVault(await getVault(program));
    }
    createVault();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);

      const list = await (await metaplex.nfts().findAllByOwner(new PublicKey(address))).filter(nft =>
        nft.creators && nft.creators.filter(creator => creator.address.toString() === candyMachine).length && nft.name
      );

      console.log(list);

      setCtzns(list.filter(nft => nft.symbol === "CTZN"));
      setAliens(list.filter(nft => nft.symbol !== "CTZN"));

      setStakedCtzns(list);
      setStakedAliens(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (address) {
      console.log(address)
      fetchNFTs();
    }
  }, [address]);

  // useEffect(() => {
  //   if (!ctzns && !aliens) {
  //     return;
  //   }

  //   const execute = async () => {
  //     await loadData(ctzns);
  //     await loadData(aliens);
  //     setLoading(false);
  //   };
  //   execute();
  // }, [ctzns, aliens]);

  const loadData = async (nfts) => {
    const nftsToLoad = nfts.filter((nft) => {
      return (
        nft.metadataTask.isPending()
      );
    });

    const promises = nftsToLoad.map((nft) => nft.metadataTask && nft.metadataTask.run());
    await Promise.all(promises);
  };

  const handleClickStakeCtzn = async () => {
    setStakeDialogOpen(false);
    try {
      const userData = await vault.fetchUser(wallet.publicKey);
      console.log(userData);
      
    } catch (error) {
      console.log(error);
      await vault.createUser({
        authority: wallet,
      })
    }
  }

  return (
    <>
      {address && <div>
        {loading ? (
          <img className={styles.loadingIcon} src="/loading.svg" alt="" />
        ) : <div className="fixed inset-0 flex items-center justify-center flex-col">
          {(!!ctzns.length || !!aliens.length) && <button
            type="button"
            onClick={() => {
              setStakeDialogOpen(true);
              setSelectedNfts([]);
            }}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Play Now
          </button>}

          <div className="mt-4 flex justify-center space-x-4">
            <div className="border-2 border-indigo-600 p-4 w-[400px] h-[400px] flex items-center flex-col">
              <h1 className="text-3xl">CTZNS</h1>
              <div className="w-[150px] h-[150px] border border-indigo-600 mt-6"></div>
              <div className="flex justify-evenly w-full mt-10">
                <div className="flex flex-col justify-center">
                  <h1>Total Staked</h1>
                  <h1>{stakedCtzns.length}</h1>
                </div>
                <div className="flex flex-col justify-center">
                  <h1>$FLWRS Yielded</h1>
                  <h1>0</h1>
                </div>
              </div>
              <div className="flex justify-evenly w-full mt-10">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Harvest $FLWRS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCtznDialogOpen(true);
                    setSelectedNfts([]);
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Un-stake CTZN
                </button>
              </div>
            </div>
            <div className="border-2 border-indigo-600 p-4 w-[400px] h-[400px] flex items-center flex-col">
              <h1 className="text-3xl">ALIENS</h1>
              <div className="w-[150px] h-[150px] border border-indigo-600 mt-6"></div>
              <div className="flex justify-evenly w-full mt-10">
                <div className="flex flex-col justify-center">
                  <h1>Total Staked</h1>
                  <h1>{stakedAliens.length}</h1>
                </div>
                <div className="flex flex-col justify-center">
                  <h1>$FLWRS Yielded</h1>
                  <h1>0</h1>
                </div>
              </div>
              <div className="flex justify-evenly w-full mt-10">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Harvest $FLWRS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAlienDialogOpen(true);
                    setSelectedNfts([]);
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Un-stake ALIEN
                </button>
              </div>
            </div>
          </div>
        </div>}

        <Transition appear show={stakeDialogOpen}>
          <Dialog as="div" className="relative z-10" onClose={() => setStakeDialogOpen(false)}>
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    {!!ctzns.length && <div className="border-2 border-indigo-600 p-4">
                      <div className="flex space-x-4 items-center">
                        <h3>CTZNS</h3>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={handleClickStakeCtzn}
                        >
                          Stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setStakeDialogOpen(false)}
                        >
                          Stake All
                        </button>
                      </div>
                      <div className="w-[600px] h-[150px] overflow-x-auto flex items-center">
                        <div className="flex space-x-4 ">
                          {ctzns.map(nft => (
                            <div
                              key={nft.mint}
                              onClick={() => {
                                if (selectedNfts.includes(nft.mint)) {
                                  setSelectedNfts(selectedNfts.filter(mint => mint !== nft.mint));
                                } else {
                                  setSelectedNfts(selectedNfts.concat(nft.mint));
                                }
                              }}
                              className={`w-[120px] h-[120px] rounded-lg ${selectedNfts.includes(nft.mint) ? "border-2 border-red-400" : "border border-indigo-400"}`}
                            >
                              <img
                                className="w-full h-full rounded-lg p-1"
                                src={nft.metadata.image || '/fallbackImage.jpg'}
                                alt="The downloaded illustration of the provided NFT address."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>}

                    {!!aliens.length && <div className="mt-4 border-2 border-indigo-600 p-4">
                      <div className="flex space-x-4 items-center">
                        <h3>ALIENS</h3>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setStakeDialogOpen(false)}
                        >
                          Stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setStakeDialogOpen(false)}
                        >
                          Stake All
                        </button>
                      </div>
                      <div className="w-[600px] h-[150px] overflow-x-auto flex items-center">
                        <div className="flex space-x-4 ">
                          {aliens.map(nft => (
                            <div
                              key={nft.mint}
                              onClick={() => {
                                if (selectedNfts.includes(nft.mint)) {
                                  setSelectedNfts(selectedNfts.filter(mint => mint !== nft.mint));
                                } else {
                                  setSelectedNfts(selectedNfts.concat(nft.mint));
                                }
                              }}
                              className={`w-[120px] h-[120px] rounded-lg ${selectedNfts.includes(nft.mint) ? "border-2 border-red-400" : "border border-indigo-400"}`}
                            >
                              <img
                                className="w-full h-full rounded-lg p-1"
                                src={nft.metadata.image || '/fallbackImage.jpg'}
                                alt="The downloaded illustration of the provided NFT address."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={ctznDialogOpen}>
          <Dialog as="div" className="relative z-10" onClose={() => setCtznDialogOpen(false)}>
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="p-4">
                      <div className="flex space-x-4 items-center justify-center">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => setStakeDialogOpen(false)}
                        >
                          Un-stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => setStakeDialogOpen(false)}
                        >
                          Un-stake All
                        </button>
                      </div>
                      <div className="w-[520px] mt-4">
                        <div className="flex flex-wrap justify-start">
                          {stakedCtzns.map(nft => (
                            <div
                              key={nft.mint}
                              onClick={() => {
                                if (selectedNfts.includes(nft.mint)) {
                                  setSelectedNfts(selectedNfts.filter(mint => mint !== nft.mint));
                                } else {
                                  setSelectedNfts(selectedNfts.concat(nft.mint));
                                }
                              }}
                              className={`w-[120px] h-[120px] m-[5px] rounded-lg ${selectedNfts.includes(nft.mint) ? "border-2 border-red-400" : "border border-indigo-400"}`}
                            >
                              <img
                                className="w-full h-full rounded-lg p-1"
                                src={nft.metadata.image || '/fallbackImage.jpg'}
                                alt="The downloaded illustration of the provided NFT address."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={alienDialogOpen}>
          <Dialog as="div" className="relative z-10" onClose={() => setAlienDialogOpen(false)}>
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="p-4">
                      <div className="flex space-x-4 items-center justify-center">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => setStakeDialogOpen(false)}
                        >
                          Un-stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        // onClick={() => setStakeDialogOpen(false)}
                        >
                          Un-stake All
                        </button>
                      </div>
                      <div className="w-[520px] mt-4">
                        <div className="flex flex-wrap justify-start">
                          {stakedAliens.map(nft => (
                            <div
                              key={nft.mint}
                              onClick={() => {
                                if (selectedNfts.includes(nft.mint)) {
                                  setSelectedNfts(selectedNfts.filter(mint => mint !== nft.mint));
                                } else {
                                  setSelectedNfts(selectedNfts.concat(nft.mint));
                                }
                              }}
                              className={`w-[120px] h-[120px] m-[5px] rounded-lg ${selectedNfts.includes(nft.mint) ? "border-2 border-red-400" : "border border-indigo-400"}`}
                            >
                              <img
                                className="w-full h-full rounded-lg p-1"
                                src={nft.metadata.image || '/fallbackImage.jpg'}
                                alt="The downloaded illustration of the provided NFT address."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>}
    </>
  );
};

export default ShowNFTs;