import { config } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";
import Ask from "https://deno.land/x/ask@1.0.6/mod.ts";
import { ethers } from "https://esm.sh/ethers?dts";
import { sendLineNotify } from "./utils/line-helper.ts";

const { INFURA_URL, CONTRACT_ADDRESS } = config();

const ask = new Ask();
const answer = await ask.prompt([
  {
    name: "address",
    type: "input",
    message: "target address",
    validate: (val) => val === "" || !isNaN(parseInt(String(val))),
  },
]);
const target = String(answer.address);
const provider = new ethers.providers.WebSocketProvider(INFURA_URL);
const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)",
  "event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress)",
  "event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress)",
];
const erc721 = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

console.log("blockNumber:", await provider.getBlockNumber());
console.log("target:", target || "none");

const sendNotify = async (
  text: string,
  transactionHash: string,
  punkIndex: number
): Promise<void> => {
  const punkIndexStr = punkIndex.toString().padStart(4, "0");
  const url = `https://www.larvalabs.com/public/images/cryptopunks/punk${punkIndexStr}.png`;
  const message = `${text} \nPlease refer to https://etherscan.io/tx/${transactionHash}`;

  await sendLineNotify({ message, imageFullsize: url, imageThumbnail: url });
};

erc721.on("PunkTransfer", (from, to, punkIndex, { transactionHash }) => {
  const msg = `PunkTransfer: #${punkIndex} was transferd from ${from} to ${to}.`;
  if (!target || target.toLocaleLowerCase() === from.toLocaleLowerCase()) {
    sendNotify(msg, transactionHash, punkIndex);
  }
});

erc721.on("PunkOffered", (punkIndex, minValue, _, { transactionHash }) => {
  const etherStr = ethers.utils.formatEther(minValue);
  const msg = `PunkOffered: #${punkIndex} was offerd for ${etherStr} ether.`;
  sendNotify(msg, transactionHash, punkIndex);
});
