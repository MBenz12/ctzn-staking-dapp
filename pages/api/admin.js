import { writeFile } from "fs";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import mints from '../../fixtures/777ctzns-hashlist.json';
import { sleep } from "../../fixtures/lib";

export default async function handler(req, res) {
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const keypair = Keypair.generate();
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));

    let i = 0;
    for (const addr of mints) {
        const mint = new PublicKey(addr);
        const nft = await metaplex.nfts().findByMint(mint);
        const obj = {};
        obj.name = nft.name;
        obj.symbol = nft.symbol;
        obj.uri = nft.uri;
        obj.seller_fee_basis_points = nft.sellerFeeBasisPoints;
        obj.creators = nft.creators;
        writeFile(`metadata/${i}.json`, JSON.stringify(obj), (err) => {
            if (err) throw err;
            console.log("success");
        });
        
        i++;
        await sleep(1000);
    }

    res.status(200).json({ name: 'John Doe' })
}
