import Ask from "https://deno.land/x/ask@1.0.6/mod.ts";
import { bootstrap } from "https://deno.land/x/inject@v0.1.2/mod.ts";
import { ethers } from "https://esm.sh/ethers?dts";

import { Main } from "./main.ts";

const ask = new Ask();
const answer = await ask.prompt([
  {
    name: "address",
    type: "input",
    message: "target address",
    validate: (val) => val === "" || (!!val && ethers.utils.isAddress(val)),
  },
]);

const main = bootstrap(Main);
await main.run(String(answer.address));
