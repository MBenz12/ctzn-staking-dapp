/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
// import Image from 'next/image';
import { Transition, Dialog } from '@headlessui/react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import NftStaking from '../target/idl/nft_staking.json'
import { PublicKey } from '@solana/web3.js'
import useMetaplex from '../hooks/useMetaplex'
import styles from '../styles/Home.module.css'
import {
  checkTokenAccounts,
  createVault,
  getTokenAmounts,
  getUserAddress,
  getVault,
  toPublicKey,
} from '../fixtures/lib'
const candyMachine = 'CUDGnANU3DEFcGEsppXwqjTD9nUFCFbBmrBUVjPfwPHb'
// const candyMachine = "8XrvWo4ywz6kzN7cDekmAZYyfCP8ZMQHLaaqkxFp9vhH";

const Timer = ({ stakedTime }) => {
  const [remainedTime, setRemainedTime] = useState(0)
  const timeout = () => {
    setRemainedTime(
      48 * 3600 - Math.floor(new Date().getTime() / 1000) + stakedTime,
    )
  }
  useEffect(() => {
    setInterval(timeout, 1000)
  }, [])
  return (
    <>
      {remainedTime > 0 && (
        <div className="text-[#f00]">
          {Math.floor(remainedTime / 3600)}:
          {Math.floor((remainedTime % 3600) / 60)}:{remainedTime % 60}
        </div>
      )}
    </>
  )
}

const CtznYielded = ({ ctznUserData }) => {
  const [ctznYieldedAmount, setCtznYieldedAmount] = useState(0)
  const timeout = () => {
    let yieldedAmount = 0

    ctznUserData.items.forEach((stakeItem) => {
      const timeDiff =
        new Date().getTime() / 1000 - stakeItem.lastClaimedTime.toNumber()

      yieldedAmount += (timeDiff * 36) / 3600 / 24
    })

    setCtznYieldedAmount(yieldedAmount)
  }
  useEffect(() => {
    if (ctznUserData && ctznUserData.items) {
      setInterval(timeout, 1000)
    }
  }, [ctznUserData])
  return (
    <>
      {ctznYieldedAmount.toLocaleString('en-us', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })}
    </>
  )
}

const ShowNFTs = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const provider = new anchor.AnchorProvider(connection, wallet)
  anchor.setProvider(provider)
  const program = new Program(
    NftStaking,
    process.env.NEXT_PUBLIC_PROGRAM_ID,
    provider,
  )

  const { metaplex } = useMetaplex()
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false)
  const [ctznDialogOpen, setCtznDialogOpen] = useState(false)
  const [alienDialogOpen, setAlienDialogOpen] = useState(false)
  const [stakedCtzns, setStakedCtzns] = useState([])
  const [stakedAliens, setStakedAliens] = useState([])
  const [stakedTimes, setStakedTimes] = useState([])
  const [ctznAccounts, setCtznAccounts] = useState([])
  const [alienAccounts, setAlienAccounts] = useState([])
  const [ctzns, setCtzns] = useState([])
  const [aliens, setAliens] = useState([])
  const [selectedNfts, setSelectedNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [vault, setVault] = useState()

  const [alienYieldedAmount, setAlienYieldedAmount] = useState(0)
  const [alienTypes, setAlienTypes] = useState({})
  const [ctznUserData, setCtznUserData] = useState()

  useEffect(() => {
    const createVault = async () => {
      setVault(await getVault(program))
    }
    createVault()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const [userCtznAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        0,
      )
      const [userAlienAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        1,
      )

      const ctznUserData = await vault.fetchUser(userCtznAddress)
      const alienUserData = await vault.fetchUser(userAlienAddress)
      const vaultData = await vault.fetch()

      setCtznUserData(ctznUserData)

      let yieldedAmount = 0
      if (alienUserData && alienUserData.items) {
        alienUserData.items.forEach((stakeItem) => {
          const alien = vaultData.aliens.filter(
            (alien) => alien.mint.toString() === stakeItem.mint.toString(),
          )[0]
          yieldedAmount += alien.earnedReward.toNumber()
        })
      }

      setAlienYieldedAmount(yieldedAmount / 100)
      console.log(vaultData)
    } catch (error) {
      console.log(error)
    }

    setLoading(false)
  }

  const fetchNFTs = async () => {
    setLoading(true)
    try {
      const list = (
        // await metaplex.nfts().findAllByOwner(new PublicKey("6EqHfjgsZQ5Y1u9k6M2xNw3EExAZdoFWmaAzrFtcghJd"))
        await metaplex.nfts().findAllByOwner(new PublicKey(wallet.publicKey))
      )
        .filter(
          (nft) =>
            nft.creators &&
            nft.creators.filter(
              (creator) => creator.address.toString() === candyMachine,
            ).length &&
            nft.name,
        )

      const types = {}
      list
        .filter((nft) => nft.symbol !== 'CTZN')
        .forEach((nft) => (types[nft.mint] = nft.symbol))

      setAlienTypes(types)
      setCtzns(list.filter((nft) => nft.symbol === 'CTZN'))
      setAliens(list.filter((nft) => nft.symbol !== 'CTZN'))

      if (vault && wallet.publicKey) {
        const [ctznUserAddress] = await getUserAddress(
          vault.key,
          wallet.publicKey,
          program,
          0,
        )
        const ctznUserData = await vault.fetchUser(ctznUserAddress)

        const [alienUserAddress] = await getUserAddress(
          vault.key,
          wallet.publicKey,
          program,
          1,
        )
        const alienUserData = await vault.fetchUser(alienUserAddress)

        const ctznMints = (ctznUserData?.items || []).map(
          (storeItem) => storeItem.mint,
        )
        const alienMints = (alienUserData?.items || []).map(
          (storeItem) => storeItem.mint,
        )

        setStakedTimes(
          (alienUserData?.items || []).map((storeItem) =>
            storeItem.firstStakedTime.toNumber(),
          ),
        )

        setStakedCtzns(await metaplex.nfts().findAllByMintList(ctznMints))
        setStakedAliens(await metaplex.nfts().findAllByMintList(alienMints))

        setCtznAccounts(
          (ctznUserData?.items || []).map((storeItem) => storeItem.mintAccount),
        )
        setAlienAccounts(
          (alienUserData?.items || []).map(
            (storeItem) => storeItem.mintAccount,
          ),
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (wallet.publicKey && vault) {
      fetchNFTs()
      fetchUserData()
    }
  }, [wallet.publicKey, vault])

  useEffect(() => {
    if (!ctzns && !aliens && !stakedCtzns && !stakedAliens) {
      return
    }

    const execute = async () => {
      await loadData(ctzns)
      await loadData(aliens)
      await loadData(stakedCtzns)
      await loadData(stakedAliens)
      setLoading(false)
    }
    execute()
  }, [ctzns, aliens, stakedCtzns, stakedAliens])

  const loadData = async (nfts) => {
    try {
      const nftsToLoad = nfts.filter((nft) => {
        return nft.metadataTask.isPending()
      })

      const promises = nftsToLoad.map(
        (nft) => nft.metadataTask && nft.metadataTask.run(),
      )
      await Promise.all(promises)
    } catch (error) {
      console.log(error)
    }
  }

  const handleClickStakeCtzn = async (all) => {
    setLoading(true)
    try {
      const [userAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        0,
      )
      try {
        const userData = await vault.fetchUser(userAddress, 0)
        if (!userData) {
          await vault.createUser({
            authority: wallet,
            userType: 0,
          })
        }
      } catch (error) {
        console.log(error)
        await vault.createUser({
          authority: wallet,
          userType: 0,
        })
      }

      let selectedCtzns
      if (all) {
        selectedCtzns = ctzns.map((nft) => nft.mint)
      } else {
        selectedCtzns = selectedNfts.filter(
          (mint) => ctzns.filter((nft) => nft.mint === mint).length,
        )
      }

      if (!selectedCtzns.length) {
        setLoading(false)
        return
      }
      await vault.stake(0, wallet, userAddress, selectedCtzns)

      fetchNFTs()
      fetchUserData()
      setStakeDialogOpen(false)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const handleClickStakeAlien = async (all) => {
    setLoading(true)
    try {
      const [userAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        1,
      )
      try {
        const userData = await vault.fetchUser(userAddress, 1)
        if (!userData) {
          await vault.createUser({
            authority: wallet,
            userType: 1,
          })
        }
      } catch (error) {
        console.log(error)
        await vault.createUser({
          authority: wallet,
          userType: 1,
        })
      }

      let selectedAliens
      if (all) {
        selectedAliens = aliens.map((nft) => nft.mint)
      } else {
        selectedAliens = selectedNfts.filter(
          (mint) => aliens.filter((nft) => nft.mint === mint).length,
        )
      }

      if (!selectedAliens.length) {
        setLoading(false)
        return
      }
      await vault.stake(1, wallet, userAddress, selectedAliens, alienTypes)

      fetchNFTs()
      fetchUserData()
      setStakeDialogOpen(false)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const handleClickUnstakeCtzn = async (all) => {
    if (!stakedCtzns.length) return

    setLoading(true)
    try {
      const [userAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        0,
      )

      let selectedCtzns
      if (all) {
        selectedCtzns = stakedCtzns.map((nft) => nft.mint)
      } else {
        selectedCtzns = selectedNfts.filter(
          (mint) => stakedCtzns.filter((nft) => nft.mint === mint).length,
        )
      }

      if (!selectedCtzns.length) {
        setLoading(false)
        return
      }

      const stakeAccounts = []
      for (const nft of selectedCtzns) {
        const idx = stakedCtzns.map((nft) => nft.mint).indexOf(nft)
        stakeAccounts.push(ctznAccounts[idx])
      }
      await vault.unstake(wallet, userAddress, stakeAccounts, 0)

      fetchNFTs()
      fetchUserData()
      setCtznDialogOpen(false)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const handleClickUnstakeAlien = async (all) => {
    if (!stakedAliens.length) return

    setLoading(true)
    try {
      const [userAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        1,
      )

      let selectedAliens
      if (all) {
        selectedAliens = stakedAliens
          .map((nft) => nft.mint)
          .filter(
            (_, index) =>
              48 * 3600 +
                stakedTimes[index] -
                Math.floor(new Date().getTime() / 1000) <
              0,
          )
      } else {
        selectedAliens = selectedNfts.filter(
          (mint) => stakedAliens.filter((nft) => nft.mint === mint).length,
        )
      }

      if (!selectedAliens.length) {
        setLoading(false)
        return
      }

      const stakeAccounts = []
      for (const nft of selectedAliens) {
        const idx = stakedAliens.map((nft) => nft.mint).indexOf(nft)
        stakeAccounts.push(alienAccounts[idx])
      }
      await vault.unstake(wallet, userAddress, stakeAccounts, 1)

      fetchNFTs()
      fetchUserData()
      setAlienDialogOpen(false)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const handleClickHarvest = async (userType) => {
    setLoading(true)
    try {
      const [userAddress] = await getUserAddress(
        vault.key,
        wallet.publicKey,
        program,
        userType,
      )

      console.log(await vault.fetchUser(userAddress))
      await vault.claim(wallet, userAddress, userType)
      fetchUserData()
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="">
        <div className="lg:my-[80px] md:my-[40px] my-[30px] flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (!ctzns.length && !aliens.length) return
              setStakeDialogOpen(true)
              setSelectedNfts([])
            }}
            className="h-[80px] sm:w-[400px] w-[300px] rounded-[10px] bg-[#b11fff] hover:bg-[#a10fef] active:bg-[#b11fff] sm:text-[50px] text- text-white"
          >
            PLAY NOW
          </button>
        </div>
        <div className="lg:mb-[100px] md:mb-[40px] mb-[20px] flex justify-center flex-wrap xl:flex-nowrap">
          <div className="w-[700px] bg-black/[0.58] border-[5px] rounded-[10px] border-[#5200B5]/[0.88] p-[10px] sm:mx-[30px] mx-[10px] mb-[20px]">
            <div className="lg:mt-[60px] mt-[40px] flex justify-center">
              <img
                src="./ctzns.png"
                alt=""
                className="lg:w-[500px] md:w-[400px] w-[300px]"
              ></img>
            </div>
            <div className="lg:mt-[40px] mt-[30px] flex justify-center">
              <div className="lg:w-[300px] md:w-[280px] w-[250px] lg:h-[300px] md:h-[280px] h-[250px] rounded-[10px] bg-white/[0.5]"></div>
            </div>
            <div className="lg:mt-[60px] mt-[40px] text-white  grid grid-cols-2">
              <div className="text-center md:text-[50px] text-[40px]">
                TOTAL STAKED
              </div>
              <div className="text-center md:text-[50px] text-[40px]">
                $FLWRS YIELDED
              </div>
              <div className="text-center md:text-[75px] text-[60px]">
                {stakedCtzns.length}
              </div>
              <div className="text-center md:text-[75px] text-[60px]">
                <CtznYielded ctznUserData={ctznUserData} />
              </div>
            </div>
            <div className="lg:my-[60px] my-[30px] grid grid-cols-2">
              <div className="flex justify-center px-[5px]">
                <button
                  onClick={() => {
                    if (!stakedCtzns.length) return
                    handleClickHarvest(0)
                  }}
                  className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#ffa91e] hover:bg-[#ef990e] active:bg-[#ffa91e] md:text-[38px] text-[28px] text-white leading-[1]"
                >
                  HARVEST FLWRS
                </button>
              </div>
              <div className="flex justify-center px-[5px]">
                <button
                  onClick={() => {
                    if (!stakedCtzns.length) return

                    setCtznDialogOpen(true)
                    setSelectedNfts([])
                  }}
                  className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#c7061d] hover:bg-[#d7000d] active:bg-[#c7061d] md:text-[38px] text-[28px] text-white leading-[1]"
                >
                  UN-STAKE CTZNS
                </button>
              </div>
            </div>
          </div>
          <div className="w-[700px] bg-black/[0.58] border-[5px] rounded-[10px] border-[#5200B5]/[0.88] p-[10px] sm:mx-[30px] mx-[10px] mb-[20px]">
            <div className="lg:mt-[60px] mt-[40px] flex justify-center">
              <img
                src="./aliens.png"
                alt=""
                className="lg:w-[500px] md:w-[400px] w-[300px]"
              ></img>
            </div>
            <div className="lg:mt-[40px] mt-[30px] flex justify-center">
              <div className="lg:w-[300px] md:w-[280px] w-[250px] lg:h-[300px] md:h-[280px] h-[250px] rounded-[10px] bg-white/[0.5]"></div>
            </div>
            <div className="lg:mt-[60px] mt-[40px] text-white  grid grid-cols-2">
              <div className="text-center md:text-[50px] text-[40px]">
                TOTAL STAKED
              </div>
              <div className="text-center md:text-[50px] text-[40px]">
                $FLWRS YIELDED
              </div>
              <div className="text-center md:text-[75px] text-[60px]">
                {stakedAliens.length}
              </div>
              <div className="text-center md:text-[75px] text-[60px]">
                {!alienYieldedAmount
                  ? 0
                  : alienYieldedAmount.toLocaleString('en-us', {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
              </div>
            </div>
            <div className="lg:my-[60px] my-[30px] grid grid-cols-2">
              <div className="flex justify-center px-[5px]">
                <button
                  onClick={() => {
                    if (!stakedAliens.length || !alienYieldedAmount) return
                    handleClickHarvest(1)
                  }}
                  className="h-[80px] px-[20px] py-[10px] rounded-[10px] bg-[#ffa91e] hover:bg-[#ef990e] active:bg-[#ffa91e] sm:text-[38px] text-[28px] text-white leading-[1]"
                >
                  HARVEST FLWRS
                </button>
              </div>
              <div className="flex justify-center px-[5px]">
                <button
                  onClick={() => {
                    if (!stakedAliens.length) return

                    setAlienDialogOpen(true)
                    setSelectedNfts([])
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

      {wallet.publicKey && (
        <div>
          {loading && (
            <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <img className={styles.loadingIcon} src="/loading.svg" alt="" />
            </div>
          )}

          <Transition appear show={stakeDialogOpen}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setStakeDialogOpen(false)}
            >
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
                    className="w-full flex justify-center"
                  >
                    <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-[#5200B5]/[0.78] sm:p-6 p-2 text-left align-middle shadow-xl transition-all border-[5px] border-[#5200B5]/[0.88] flex flex-col space-y-5">
                      {!!ctzns.length && (
                        <div>
                          <div className="flex items-center sm:space-x-5 my-5 w-full sm:flex-row flex-col space-y-2">
                            <img
                              src="./ctzns.png"
                              alt=""
                              className="lg:w-[400px] md:w-[300px] w-[200px]"
                            ></img>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                              onClick={() => handleClickStakeCtzn(false)}
                            >
                              STAKE
                            </button>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                              onClick={() => handleClickStakeCtzn(true)}
                            >
                              STAKE ALL
                            </button>
                          </div>
                          <div className="w-full flex items-center overflow-x-auto">
                            <div className="flex space-x-4">
                              {ctzns.map((nft) => (
                                <div
                                  key={nft.mint}
                                  onClick={() => {
                                    if (selectedNfts.includes(nft.mint)) {
                                      setSelectedNfts(
                                        selectedNfts.filter(
                                          (mint) => mint !== nft.mint,
                                        ),
                                      )
                                    } else {
                                      setSelectedNfts(
                                        selectedNfts.concat(nft.mint),
                                      )
                                    }
                                  }}
                                  className={`lg:w-[300px] md:w-[280px] sm:w-[250px] w-[200px] lg:h-[300px] md:h-[280px] sm:h-[250px] h-[200px] sm-[5px] rounded-lg ${
                                    selectedNfts.includes(nft.mint)
                                      ? 'border-2 border-red-400'
                                      : 'border border-indigo-400'
                                  }`}
                                >
                                  <img
                                    className="w-full h-full rounded-lg p-1"
                                    src={
                                      nft.metadata.image || '/fallbackImage.jpg'
                                    }
                                    alt="The downloaded illustration of the provided NFT address."
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {!!aliens.length && (
                        <div>
                          <div className="flex items-center sm:space-x-5 my-5 w-full sm:flex-row flex-col space-y-2">
                            <img
                              src="./aliens.png"
                              alt=""
                              className="lg:w-[400px] md:w-[300px] w-[200px]"
                            ></img>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                              onClick={() => handleClickStakeAlien(false)}
                            >
                              STAKE
                            </button>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                              onClick={() => handleClickStakeAlien(true)}
                            >
                              STAKE ALL
                            </button>
                          </div>
                          <div className="w-full flex items-center overflow-x-auto">
                            <div className="flex space-x-4">
                              {aliens.map((nft) => (
                                <div
                                  key={nft.mint}
                                  onClick={() => {
                                    if (selectedNfts.includes(nft.mint)) {
                                      setSelectedNfts(
                                        selectedNfts.filter(
                                          (mint) => mint !== nft.mint,
                                        ),
                                      )
                                    } else {
                                      setSelectedNfts(
                                        selectedNfts.concat(nft.mint),
                                      )
                                    }
                                  }}
                                  className={`lg:w-[300px] md:w-[280px] sm:w-[250px] w-[200px] lg:h-[300px] md:h-[280px] sm:h-[250px] h-[200px] sm-[5px] rounded-lg ${
                                    selectedNfts.includes(nft.mint)
                                      ? 'border-2 border-red-400'
                                      : 'border border-indigo-400'
                                  }`}
                                >
                                  <img
                                    className="w-full h-full rounded-lg p-1"
                                    src={
                                      nft.metadata.image || '/fallbackImage.jpg'
                                    }
                                    alt="The downloaded illustration of the provided NFT address."
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

          <Transition appear show={ctznDialogOpen}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setCtznDialogOpen(false)}
            >
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
                    className="w-full flex justify-center"
                  >
                    <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-[#5200B5]/[0.78] sm:p-6 p-2 text-left align-middle shadow-xl transition-all border-[5px] border-[#5200B5]/[0.88]">
                      <div className="flex justify-center">
                        <img
                          src="./ctzns.png"
                          alt=""
                          className="lg:w-[500px] md:w-[400px] w-[300px]"
                        ></img>
                      </div>
                      <div className="flex space-x-4 items-center justify-center my-5">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                          onClick={() => handleClickUnstakeCtzn(false)}
                        >
                          UN-STAKE
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                          onClick={() => handleClickUnstakeCtzn(true)}
                        >
                          UN-STAKE ALL
                        </button>
                      </div>
                      <div className="w-full flex items-center overflow-x-auto">
                        <div className="flex space-x-4">
                          {stakedCtzns.map((nft) => (
                            <div
                              key={nft.mint}
                              onClick={() => {
                                if (selectedNfts.includes(nft.mint)) {
                                  setSelectedNfts(
                                    selectedNfts.filter(
                                      (mint) => mint !== nft.mint,
                                    ),
                                  )
                                } else {
                                  setSelectedNfts(selectedNfts.concat(nft.mint))
                                }
                              }}
                              className={`lg:w-[300px] md:w-[280px] sm:w-[250px] w-[200px] lg:h-[300px] md:h-[280px] sm:h-[250px] h-[200px] sm-[5px] rounded-lg ${
                                selectedNfts.includes(nft.mint)
                                  ? 'border-2 border-red-400'
                                  : 'border border-indigo-400'
                              }`}
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
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

          <Transition appear show={alienDialogOpen}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setAlienDialogOpen(false)}
            >
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

              <div className="fixed !w-screen inset-0 overflow-y-auto">
                <div className="flex w-full min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                    className="w-full flex justify-center"
                  >
                    <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-[#5200B5]/[0.78] sm:p-6 p-2 text-left align-middle shadow-xl transition-all border-[5px] border-[#5200B5]/[0.88]">
                      <div className="flex justify-center">
                        <img
                          src="./aliens.png"
                          alt=""
                          className="lg:w-[500px] md:w-[400px] w-[300px]"
                        ></img>
                      </div>
                      <div className="flex space-x-4 items-center justify-center my-5">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-[30px] text-[24px]"
                          onClick={() => handleClickUnstakeAlien(false)}
                        >
                          UN-STAKE
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-4 text-sm font-bold text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2  sm:text-[30px] text-[24px]"
                          onClick={() => handleClickUnstakeAlien(true)}
                        >
                          UN-STAKE ALL
                        </button>
                      </div>
                      <div className="w-full flex items-center overflow-x-auto">
                        <div className="flex space-x-4">
                          {stakedAliens.map((nft, index) => (
                            <div
                              className="flex flex-col items-center"
                              key={nft.mint}
                            >
                              <div
                                onClick={() => {
                                  if (
                                    48 * 3600 -
                                      Math.floor(new Date().getTime() / 1000) +
                                      stakedTimes[index] >
                                    0
                                  ) {
                                    return
                                  }

                                  if (selectedNfts.includes(nft.mint)) {
                                    setSelectedNfts(
                                      selectedNfts.filter(
                                        (mint) => mint !== nft.mint,
                                      ),
                                    )
                                  } else {
                                    setSelectedNfts(
                                      selectedNfts.concat(nft.mint),
                                    )
                                  }
                                }}
                                className={`lg:w-[300px] md:w-[280px] sm:w-[250px] w-[200px] lg:h-[300px] md:h-[280px] sm:h-[250px] h-[200px] sm-[5px] rounded-lg ${
                                  selectedNfts.includes(nft.mint)
                                    ? 'border-2 border-red-400'
                                    : 'border border-indigo-400'
                                }`}
                              >
                                <img
                                  className="w-full h-full rounded-lg p-1"
                                  src={
                                    nft.metadata.image || '/fallbackImage.jpg'
                                  }
                                  alt="The downloaded illustration of the provided NFT address."
                                />
                              </div>
                              <Timer stakedTime={stakedTimes[index]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      )}
    </>
  )
}

export default ShowNFTs
