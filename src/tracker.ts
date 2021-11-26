import { config } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";
import { Bootstrapped } from "https://deno.land/x/inject@v0.1.2/mod.ts";
import { ethers } from "https://esm.sh/ethers?dts";

import { LineService, LoadingService } from "./services/mod.ts";

const { INFURA_URL, CONTRACT_ADDRESS } = config();

const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)",
  "event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress)",
  "event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress)",
];

@Bootstrapped()
export class Tracker {
  private readonly provider: ethers.providers.WebSocketProvider;
  private readonly contract: ethers.Contract;

  constructor(
    private readonly loadingService: LoadingService,
    private readonly lineService: LineService
  ) {
    this.provider = new ethers.providers.WebSocketProvider(INFURA_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, this.provider);
  }

  async run(address?: string): Promise<void> {
    console.log("blockNumber:", await this.provider.getBlockNumber());
    console.log("target:", address || "none");

    this.contract.on(
      "PunkTransfer",
      (from, to, punkIndex, { transactionHash }) => {
        const msg = `PunkTransfer: #${punkIndex} was transferd from ${from} to ${to}.`;
        if (
          !address ||
          address.toLocaleLowerCase() === from.toLocaleLowerCase()
        ) {
          this.sendNotify(msg, transactionHash, punkIndex);
        }
      }
    );

    this.contract.on(
      "PunkOffered",
      (punkIndex, minValue, _, { transactionHash }) => {
        const etherStr = ethers.utils.formatEther(minValue);
        const msg = `PunkOffered: #${punkIndex} was offerd for ${etherStr} ether.`;
        this.sendNotify(msg, transactionHash, punkIndex);
      }
    );

    this.loadingService.showLoading();
  }

  private async sendNotify(
    text: string,
    transactionHash: string,
    punkIndex: number
  ): Promise<void> {
    const punkIndexStr = punkIndex.toString().padStart(4, "0");
    const url = `https://www.larvalabs.com/public/images/cryptopunks/punk${punkIndexStr}.png`;
    const message = `${text} \nPlease refer to https://etherscan.io/tx/${transactionHash}`;

    await this.loadingService.stopLoadinng();
    await this.lineService.sendNotify({
      message,
      imageFullsize: url,
      imageThumbnail: url,
    });
    this.loadingService.showLoading();
  }
}
