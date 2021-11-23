import { config } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";
import { ethers } from "https://esm.sh/ethers?dts";

import { sendLineNotify } from "./utils/line-helper.ts";

const { INFURA_URL, CONTRACT_ADDRESS } = config();

const provider = new ethers.providers.WebSocketProvider(INFURA_URL);
const blockNumber = await provider.getBlockNumber();
console.log("blockNumber:", blockNumber);

const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)",
  "event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress)",
  "event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress)",
];

const sendNotify = async (
  text: string,
  transactionHash: string,
  punkIndex: number
): Promise<void> => {
  const punkIndexStr = punkIndex.toString().padStart(4, "0");
  const url = `https://www.larvalabs.com/public/images/cryptopunks/punk${punkIndexStr}.png`;
  const message = `${text} \nPlease refer to https://etherscan.io/tx/${transactionHash}`;

  console.log(message);
  console.log(url);

  await sendLineNotify({ message, imageFullsize: url, imageThumbnail: url });
};

const erc721 = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

erc721.on("PunkTransfer", (owner, to, punkIndex, { transactionHash }) => {
  const msg = `PunkTransfer: ${punkIndex} was transferd from ${owner} to ${to}.`;
  sendNotify(msg, transactionHash, punkIndex);
});

erc721.on("PunkBought", (punkIndex, value, owner, to, { transactionHash }) => {
  const etherStr = ethers.utils.formatEther(value);
  const msg = `PunkBought: ${punkIndex} was bought from ${owner} to ${to} for ${etherStr} ether.`;
  sendNotify(msg, transactionHash, punkIndex);
});

erc721.on("PunkOffered", (punkIndex, minValue, to, { transactionHash }) => {
  const etherStr = ethers.utils.formatEther(minValue);
  const msg = `PunkOffered: ${punkIndex} was offerd from ${to} for ${etherStr} ether.`;
  sendNotify(msg, transactionHash, punkIndex);
});
