# nft-tracker

## Command
```bash
# local
$ deno run --allow-env --allow-read --allow-net=notify-api.line.me,mainnet.infura.io -c tsconfig.json ./src/mod.ts
# docker
$ docker build -t nft .
$ docker run --name nft -it nft
$ docker start nft -i
```