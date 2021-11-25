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
    message: "What's target address?",
    validate: (val) => val === "" || !isNaN(parseInt(String(val))),
  },
]);

const provider = new ethers.providers.WebSocketProvider(INFURA_URL);
const blockNumber = await provider.getBlockNumber();
console.log("blockNumber:", blockNumber);

const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)",
  "event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress)",
  "event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress)",
];

const getAddressName = async (address: string): Promise<string> => {
  const ensName = await provider.lookupAddress(address);
  return ensName || address;
};

const address = String(answer.address);
const target = address && (await getAddressName(address));
console.log("target:", target || "none");

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

erc721.on("PunkTransfer", async (from, to, punkIndex, { transactionHash }) => {
  const owner = await getAddressName(from);
  const reciever = await getAddressName(to);
  const msg = `PunkTransfer: ${punkIndex} was transferd from ${owner} to ${reciever}.`;
  if (!target || target.toLocaleLowerCase() === owner.toLocaleLowerCase()) {
    sendNotify(msg, transactionHash, punkIndex);
  }
});

erc721.on(
  "PunkOffered",
  async (punkIndex, minValue, to, { transactionHash }) => {
    const etherStr = ethers.utils.formatEther(minValue);
    const reciever = await getAddressName(to);
    const msg = `PunkOffered: ${punkIndex} was offerd from ${reciever} for ${etherStr} ether.`;
    sendNotify(msg, transactionHash, punkIndex);
  }
);
