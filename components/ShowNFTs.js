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
  getUserAddress,
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
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [ctznDialogOpen, setCtznDialogOpen] = useState(false);
  const [alienDialogOpen, setAlienDialogOpen] = useState(false);
  const [stakedCtzns, setStakedCtzns] = useState([]);
  const [stakedAliens, setStakedAliens] = useState([]);
  const [ctznAccounts, setCtznAccounts] = useState([]);
  const [alienAccounts, setAlienAccounts] = useState([]);
  const [ctzns, setCtzns] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [selectedNfts, setSelectedNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vault, setVault] = useState();

  useEffect(() => {
    const createVault = async () => {
      setVault(await getVault(program));
    }
    createVault();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);

      const list = await (await metaplex.nfts().findAllByOwner(new PublicKey(wallet.publicKey))).filter(nft =>
        nft.creators && nft.creators.filter(creator => creator.address.toString() === candyMachine).length && nft.name
      );

      setCtzns(list.filter(nft => nft.symbol === "CTZN"));
      setAliens(list.filter(nft => nft.symbol !== "CTZN"));

      if (vault && wallet.publicKey) {
        const [ctznUserAddress] = await getUserAddress(vault.key, wallet.publicKey, program, 0);
        const ctznUserData = await vault.fetchUser(ctznUserAddress);

        const [alienUserAddress] = await getUserAddress(vault.key, wallet.publicKey, program, 1);
        const alienUserData = await vault.fetchUser(alienUserAddress);

        const ctznMints = (ctznUserData?.items || []).map(storeItem => storeItem.mint);
        const alienMints = (alienUserData?.items || []).map(storeItem => storeItem.mint);

        setStakedCtzns(await metaplex.nfts().findAllByMintList(ctznMints));
        setStakedAliens(await metaplex.nfts().findAllByMintList(alienMints));

        setCtznAccounts((ctznUserData?.items || []).map(storeItem => storeItem.mintAccount));
        setAlienAccounts((alienUserData?.items || []).map(storeItem => storeItem.mintAccount));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (wallet.publicKey && vault) {
      fetchNFTs();
    }
  }, [wallet.publicKey, vault]);

  useEffect(() => {
    if (!ctzns && !aliens && !stakedCtzns && !stakedAliens) {
      return;
    }

    const execute = async () => {
      await loadData(ctzns);
      await loadData(aliens);
      await loadData(stakedCtzns);
      await loadData(stakedAliens);
      setLoading(false);
    };
    execute();
  }, [ctzns, aliens, stakedCtzns, stakedAliens]);

  const loadData = async (nfts) => {
    const nftsToLoad = nfts.filter((nft) => {
      return (
        nft.metadataTask.isPending()
      );
    });

    const promises = nftsToLoad.map((nft) => nft.metadataTask && nft.metadataTask.run());
    await Promise.all(promises);
  };

  const handleClickStakeCtzn = async (all) => {
    const [userAddress] = await getUserAddress(vault.key, wallet.publicKey, program, 0);
    try {
      const userData = await vault.fetchUser(userAddress, 0);
      if (!userData) {
        await vault.createUser({
          authority: wallet,
          userType: 0,
        });
      }
    } catch (error) {
      console.log(error);
      await vault.createUser({
        authority: wallet,
        userType: 0,
      });
    }

    let selectedCtzns;
    if (all) {
      selectedCtzns = ctzns.map(nft => nft.mint);
    } else {
      selectedCtzns = selectedNfts.filter(mint => ctzns.filter(nft => nft.mint === mint).length);
    }

    await vault.stake(0, wallet, userAddress, selectedCtzns);

    fetchNFTs();
    setStakeDialogOpen(false);
  }

  const handleClickStakeAlien = async (all) => {
    const [userAddress] = await getUserAddress(vault.key, wallet.publicKey, program, 1);
    try {
      const userData = await vault.fetchUser(userAddress, 1);
      if (!userData) {
        await vault.createUser({
          authority: wallet,
          userType: 1,
        });
      }
    } catch (error) {
      console.log(error);
      await vault.createUser({
        authority: wallet,
        userType: 1,
      });
    }

    let selectedAliens;
    if (all) {
      selectedAliens = aliens.map(nft => nft.mint);
    } else {
      selectedAliens = selectedNfts.filter(mint => aliens.filter(nft => nft.mint === mint).length);
    }

    await vault.stake(1, wallet, userAddress, selectedAliens);

    fetchNFTs();
    setStakeDialogOpen(false);
  }

  const handleClickUnstakeCtzn = async (all) => {
    if (!stakedCtzns.length) return;
    
    const [userAddress] = await getUserAddress(vault.key, wallet.publicKey, program, 0);

    let selectedCtzns;
    if (all) {
      selectedCtzns = stakedCtzns.map(nft => nft.mint);
    } else {
      selectedCtzns = selectedNfts.filter(mint => stakedCtzns.filter(nft => nft.mint === mint).length);
    }


    const stakeAccounts = [];
    for (const nft of selectedCtzns) {
      const idx = stakedCtzns.map(nft => nft.mint).indexOf(nft);
      stakeAccounts.push(ctznAccounts[idx]);
    }
    await vault.unstake(wallet, userAddress, stakeAccounts);

    fetchNFTs();
    setCtznDialogOpen(false);
  }

  const handleClickUnstakeAlien = async (all) => {
    if (!stakedAliens.length) return;

    const [userAddress] = await getUserAddress(vault.key, wallet.publicKey, program, 1);

    let selectedAliens;
    if (all) {
      selectedAliens = stakedAliens.map(nft => nft.mint);
    } else {
      selectedAliens = selectedNfts.filter(mint => stakedAliens.filter(nft => nft.mint === mint).length);
    }

    const stakeAccounts = [];
    for (const nft of selectedAliens) {
      const idx = stakedAliens.map(nft => nft.mint).indexOf(nft);
      stakeAccounts.push(alienAccounts[idx]);
    }
    await vault.unstake(wallet, userAddress, stakeAccounts);

    fetchNFTs();
    setAlienDialogOpen(false);
  }

  return (
    <>
    <div className="">
      <div className="lg:my-[80px] md:my-[40px] my-[30px] flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (!ctzns.length && !aliens.length) return;
            setStakeDialogOpen(true);
            setSelectedNfts([]);
          }}
          className="h-[80px] sm:w-[400px] w-[300px] rounded-[10px] bg-[#b11fff] hover:bg-[#a10fef] active:bg-[#b11fff] sm:text-[50px] text- text-white"
        >
          PLAY NOW
        </button>
      </div>
      <div className="lg:mb-[100px] md:mb-[40px] mb-[20px] flex justify-center flex-wrap xl:flex-nowrap">
        <div className="w-[800px] bg-black/[0.58] border-[5px] rounded-[10px] border-[#5200B5]/[0.58] p-[10px] sm:mx-[30px] mx-[10px] mb-[20px]">
          <div className="lg:mt-[60px] mt-[40px] flex justify-center">
            <img 
              src='./ctzns.png'
              alt=''
              className="lg:w-[500px] md:w-[400px] w-[300px]"
            >  
            </img>
          </div>
          <div className="lg:mt-[40px] mt-[30px] flex justify-center">
            <div className="lg:w-[300px] md:w-[280px] w-[250px] lg:h-[300px] md:h-[280px] h-[250px] rounded-[10px] bg-white/[0.5]">
              
            </div>
          </div>
          <div className="lg:mt-[60px] mt-[40px] text-white  grid grid-cols-2">
            <div className='text-center md:text-[50px] text-[40px]'>TOTAL STAKED</div>
            <div className='text-center md:text-[50px] text-[40px]'>$FLWRS YIELDED</div>
            <div className='text-center md:text-[75px] text-[60px]'>{stakedCtzns.length}</div>
            <div className='text-center md:text-[75px] text-[60px]'>5,000</div>
          </div>
          <div className="lg:my-[60px] my-[30px] grid grid-cols-2">
            <div className="flex justify-center px-[5px]">
              <button
                className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#ffa91e] hover:bg-[#ef990e] active:bg-[#ffa91e] md:text-[38px] text-[30px] text-white leading-[1]"
              >
                HARVEST FLWRS
              </button>
            </div>
            <div className="flex justify-center px-[5px]">
              <button
                onClick={() => {
                  if (!stakedCtzns.length) return;

                  setCtznDialogOpen(true);
                  setSelectedNfts([]);
                }}
                className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#c7061d] hover:bg-[#d7000d] active:bg-[#c7061d] md:text-[38px] text-[30px] text-white leading-[1]"
              >
                UN-STAKE CTZNS
              </button>
            </div>
          </div>
        </div>
        <div className="w-[800px] bg-black/[0.58] border-[5px] rounded-[10px] border-[#5200B5]/[0.58] p-[10px] sm:mx-[30px] mx-[10px] mb-[20px]">
          <div className="lg:mt-[60px] mt-[40px] flex justify-center">
            <img 
              src='./aliens.png'
              alt=''
              className="lg:w-[500px] md:w-[400px] w-[300px]"
            >  
            </img>
          </div>
          <div className="lg:mt-[40px] mt-[30px] flex justify-center">
            <div className="lg:w-[300px] md:w-[280px] w-[250px] lg:h-[300px] md:h-[280px] h-[250px] rounded-[10px] bg-white/[0.5]">
              
            </div>
          </div>
          <div className="lg:mt-[60px] mt-[40px] text-white  grid grid-cols-2">
            <div className='text-center md:text-[50px] text-[40px]'>TOTAL STAKED</div>
            <div className='text-center md:text-[50px] text-[40px]'>$FLWRS YIELDED</div>
            <div className='text-center md:text-[75px] text-[60px]'>{stakedAliens.length}</div>
            <div className='text-center md:text-[75px] text-[60px]'>5,000</div>
          </div>
          <div className="lg:my-[60px] my-[30px] grid grid-cols-2">
            <div className="flex justify-center px-[5px]">
              <button
                className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#ffa91e] hover:bg-[#ef990e] active:bg-[#ffa91e] sm:text-[38px] text-[28px] text-white leading-[1]"
              >
                HARVEST FLWRS
              </button>
            </div>
            <div className="flex justify-center px-[5px]">
              <button
                onClick={() => {
                  if (!stakedAliens.length) return;

                  setAlienDialogOpen(true);
                  setSelectedNfts([]);
                }}
                className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#551cff] hover:bg-[#450cef] active:bg-[#551cff] sm:text-[38px] text-[28px] text-white leading-[1]"
              >
                UN-STAKE ALIENS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* <div className="fixed inset-0 flex items-center justify-center flex-col">
          

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
                    if (!stakedCtzns.length) return;

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
                    if (!stakedAliens.length) return;

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
        </div> */}
      {wallet.publicKey && <div>
        {/* {loading ? (
          <img className={styles.loadingIcon} src="/loading.svg" alt="" />
        ) : } */}

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
                          onClick={() => handleClickStakeCtzn(false)}
                        >
                          Stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => handleClickStakeCtzn(true)}
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
                          onClick={() => handleClickStakeAlien(false)}
                        >
                          Stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => handleClickStakeAlien(true)}
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
                          onClick={() => handleClickUnstakeCtzn(false)}
                        >
                          Un-stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => handleClickUnstakeCtzn(true)}
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
                          onClick={() => handleClickUnstakeAlien(false)}
                        >
                          Un-stake
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => handleClickUnstakeAlien(true)}
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