import Ask from "https://deno.land/x/ask@1.0.6/mod.ts";
import { bootstrap } from "https://deno.land/x/inject@v0.1.2/mod.ts";

import { Tracker } from "./tracker.ts";

const ask = new Ask();
const answer = await ask.prompt([
  {
    name: "address",
    type: "input",
    message: "target address",
    validate: (val) => val === "" || !isNaN(parseInt(String(val))),
  },
]);

const tracker = bootstrap(Tracker);
await tracker.run(String(answer.address));
