import fs from "fs";
import path from "path";
import crypto from "crypto";

const filePath = path.join("blockchain", "block.json");

export const addToBlockchain = (hash) => {
    let chain = [];

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        chain = JSON.parse(data);
    }

    const prevHash = chain.length ? chain[chain.length - 1].currentHash : "0";

    const block = {
        index: chain.length + 1,
        timestamp: new Date().toISOString(),
        fileHash: hash,
        prevHash,
        currentHash: crypto
            .createHash("sha256")
            .update(hash + prevHash)
            .digest("hex")
    };

    chain.push(block);

    fs.writeFileSync(filePath, JSON.stringify(chain, null, 2));

    return block.currentHash;
};
