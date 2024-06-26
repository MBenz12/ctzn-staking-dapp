export type NftStaking = {
  "version": "0.1.0",
  "name": "nft_staking",
  "instructions": [
    {
      "name": "createVault",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ctznsPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "aliensPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "godsPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ctznsPoolBump",
          "type": "u8"
        },
        {
          "name": "aliensPoolBump",
          "type": "u8"
        },
        {
          "name": "godsPoolBump",
          "type": "u8"
        }
      ],
      "returns": null
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userType",
          "type": "u8"
        }
      ],
      "returns": null
    },
    {
      "name": "fund",
      "accounts": [
        {
          "name": "funder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "itemType",
          "type": "u8"
        }
      ],
      "returns": null
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unstakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultStakeBump",
          "type": "u8"
        },
        {
          "name": "manually",
          "type": "bool"
        }
      ],
      "returns": null
    },
    {
      "name": "setRandom",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": null
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unstakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userType",
          "type": "u8"
        },
        {
          "name": "all",
          "type": "bool"
        }
      ],
      "returns": null
    },
    {
      "name": "withdrawCtznsPool",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    },
    {
      "name": "withdrawAliensPool",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    },
    {
      "name": "withdrawGodsPool",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "VaultStatus"
            }
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "ctznsPoolBump",
            "type": "u8"
          },
          {
            "name": "ctznsPoolAccount",
            "type": "publicKey"
          },
          {
            "name": "aliensPoolBump",
            "type": "u8"
          },
          {
            "name": "aliensPoolAccount",
            "type": "publicKey"
          },
          {
            "name": "godsPoolBump",
            "type": "u8"
          },
          {
            "name": "godsPoolAccount",
            "type": "publicKey"
          },
          {
            "name": "ctznsPoolAmount",
            "type": "u64"
          },
          {
            "name": "aliensPoolAmount",
            "type": "u64"
          },
          {
            "name": "godsPoolAmount",
            "type": "u64"
          },
          {
            "name": "alphaAliensCount",
            "type": "u8"
          },
          {
            "name": "normalAliensCount",
            "type": "u8"
          },
          {
            "name": "aliens",
            "type": {
              "vec": {
                "defined": "StakeItem"
              }
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "userType",
            "type": {
              "defined": "UserType"
            }
          },
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "itemsCount",
            "type": "u32"
          },
          {
            "name": "items",
            "type": {
              "vec": {
                "defined": "StakeItem"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakeItem",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "mintAccount",
            "type": "publicKey"
          },
          {
            "name": "itemType",
            "type": {
              "defined": "ItemType"
            }
          },
          {
            "name": "firstStakedTime",
            "type": "u64"
          },
          {
            "name": "lastClaimedTime",
            "type": "u64"
          },
          {
            "name": "earnedReward",
            "type": "u64"
          },
          {
            "name": "rand",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "VaultStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Initialized"
          }
        ]
      }
    },
    {
      "name": "ItemType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NormalCTZN"
          },
          {
            "name": "NormalAlien"
          },
          {
            "name": "AlphaAlien"
          },
          {
            "name": "AlienGod"
          }
        ]
      }
    },
    {
      "name": "UserType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Ctzn"
          },
          {
            "name": "Alien"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "VaultAlreadyCreated",
      "msg": "Vault already created"
    },
    {
      "code": 6001,
      "name": "VaultNotInitialized",
      "msg": "Vault didn't initialized"
    },
    {
      "code": 6002,
      "name": "UserAlreadyCreated",
      "msg": "User already created"
    },
    {
      "code": 6003,
      "name": "AlreadyStakedAccount",
      "msg": "Already staked item"
    },
    {
      "code": 6004,
      "name": "StakedAccountDoesNotExist",
      "msg": "Stake acount does not exist"
    },
    {
      "code": 6005,
      "name": "CannotUnstakeAlien",
      "msg": "Cannot Unstake Alien untill 2 days reward accrued"
    }
  ]
};

export const IDL: NftStaking = {
  "version": "0.1.0",
  "name": "nft_staking",
  "instructions": [
    {
      "name": "createVault",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ctznsPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "aliensPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "godsPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ctznsPoolBump",
          "type": "u8"
        },
        {
          "name": "aliensPoolBump",
          "type": "u8"
        },
        {
          "name": "godsPoolBump",
          "type": "u8"
        }
      ],
      "returns": null
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userType",
          "type": "u8"
        }
      ],
      "returns": null
    },
    {
      "name": "fund",
      "accounts": [
        {
          "name": "funder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "itemType",
          "type": "u8"
        }
      ],
      "returns": null
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unstakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultStakeBump",
          "type": "u8"
        },
        {
          "name": "manually",
          "type": "bool"
        }
      ],
      "returns": null
    },
    {
      "name": "setRandom",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": null
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unstakeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userType",
          "type": "u8"
        },
        {
          "name": "all",
          "type": "bool"
        }
      ],
      "returns": null
    },
    {
      "name": "withdrawCtznsPool",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ctznsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    },
    {
      "name": "withdrawAliensPool",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aliensPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    },
    {
      "name": "withdrawGodsPool",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "godsPoolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ],
      "returns": null
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "VaultStatus"
            }
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "ctznsPoolBump",
            "type": "u8"
          },
          {
            "name": "ctznsPoolAccount",
            "type": "publicKey"
          },
          {
            "name": "aliensPoolBump",
            "type": "u8"
          },
          {
            "name": "aliensPoolAccount",
            "type": "publicKey"
          },
          {
            "name": "godsPoolBump",
            "type": "u8"
          },
          {
            "name": "godsPoolAccount",
            "type": "publicKey"
          },
          {
            "name": "ctznsPoolAmount",
            "type": "u64"
          },
          {
            "name": "aliensPoolAmount",
            "type": "u64"
          },
          {
            "name": "godsPoolAmount",
            "type": "u64"
          },
          {
            "name": "alphaAliensCount",
            "type": "u8"
          },
          {
            "name": "normalAliensCount",
            "type": "u8"
          },
          {
            "name": "aliens",
            "type": {
              "vec": {
                "defined": "StakeItem"
              }
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "userType",
            "type": {
              "defined": "UserType"
            }
          },
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "itemsCount",
            "type": "u32"
          },
          {
            "name": "items",
            "type": {
              "vec": {
                "defined": "StakeItem"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakeItem",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "mintAccount",
            "type": "publicKey"
          },
          {
            "name": "itemType",
            "type": {
              "defined": "ItemType"
            }
          },
          {
            "name": "firstStakedTime",
            "type": "u64"
          },
          {
            "name": "lastClaimedTime",
            "type": "u64"
          },
          {
            "name": "earnedReward",
            "type": "u64"
          },
          {
            "name": "rand",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "VaultStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Initialized"
          }
        ]
      }
    },
    {
      "name": "ItemType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NormalCTZN"
          },
          {
            "name": "NormalAlien"
          },
          {
            "name": "AlphaAlien"
          },
          {
            "name": "AlienGod"
          }
        ]
      }
    },
    {
      "name": "UserType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Ctzn"
          },
          {
            "name": "Alien"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "VaultAlreadyCreated",
      "msg": "Vault already created"
    },
    {
      "code": 6001,
      "name": "VaultNotInitialized",
      "msg": "Vault didn't initialized"
    },
    {
      "code": 6002,
      "name": "UserAlreadyCreated",
      "msg": "User already created"
    },
    {
      "code": 6003,
      "name": "AlreadyStakedAccount",
      "msg": "Already staked item"
    },
    {
      "code": 6004,
      "name": "StakedAccountDoesNotExist",
      "msg": "Stake acount does not exist"
    },
    {
      "code": 6005,
      "name": "CannotUnstakeAlien",
      "msg": "Cannot Unstake Alien untill 2 days reward accrued"
    }
  ]
};
