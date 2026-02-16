## Overview
This repository holds smart contracts, ABI's and addresses for bridging with Hashi and three bridges: CCIP, VEA, LayerZero.
It also holds UI to interact with these deployed bridges through a lighbulb pair contract. 

## Install deps
```bash
npm i

cd contracts

forge install
```

## Frontend

```bash
npm run dev
```

Build
```bash
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sync frontend bridge routes

```bash
npm run gen:routes
```

## Publishing a package

```bash
cd contracts

forge compile --via-ir

npm run build:sdk

cd ..

npm publish
```