import { writeFile } from "fs";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import mints from '../../fixtures/777ctzns-hashlist.json';


export default async function handler(req, res) {
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const keypair = Keypair.generate();
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));

    let i = 0;
    for (const addr of mints) {
        const mint = new PublicKey(addr);
        const nft = await metaplex.nfts().findByMint(mint);
        writeFile(`metadata/${i}.json`, JSON.stringify(nft.metadata), (err) => {
            if (err) throw err;
            console.log("success");
        })
    }

    res.status(200).json({ name: 'John Doe' })
}
