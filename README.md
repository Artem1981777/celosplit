# CeloSplit 💚

> Split group expenses and settle instantly with USDm on Celo — built for MiniPay

**Live App:** https://celosplit.vercel.app

## What is CeloSplit?

CeloSplit is a MiniPay Mini App that lets friends split expenses and settle debts instantly using USDm stablecoin on the Celo blockchain. No banks, no delays, sub-cent fees.

Built for the 10M+ MiniPay users across Africa and the Global South — where splitting a dinner bill or group trip costs should be as easy as sending a text message.

## Features

- 👥 Create expense groups (trips, dinners, shared housing)
- ➕ Add expenses and split between members
- 💸 Settle debts with one tap — real USDm transfers on Celo
- 📱 Mobile-first UI optimized for MiniPay
- 🔗 Auto wallet connect inside MiniPay (no connect button needed)
- ⛽ Gas fees paid in USDm (fee abstraction)
- 🔍 Transaction explorer links via Celoscan

## Tech Stack

- React + TypeScript + Vite
- Viem v2 + Wagmi
- Celo Mainnet / Celo Sepolia Testnet
- USDm stablecoin (0x765DE816845861e75A25fCA122bb6898B8B1282a)
- Vercel deployment

## How It Works

1. Open CeloSplit inside MiniPay — wallet connects automatically
2. Create a group and add members by wallet address
3. Add expenses (dinner, taxi, hotel) and choose who paid
4. App calculates who owes what
5. Tap **Settle** — USDm transfers on-chain instantly
6. View transaction on Celoscan

## MiniPay Integration

- Auto-detects MiniPay environment via `window.ethereum.isMiniPay`
- Uses `injected()` connector for seamless wallet connection
- Fee currency set to USDm for gasless UX
- Legacy transactions for MiniPay compatibility
- Deeplink to MiniPay Add Cash screen when balance is low

## Network

- **Mainnet:** Celo (Chain ID: 42220)
- **Testnet:** Celo Sepolia (Chain ID: 44787)
- **RPC:** https://forno.celo.org

## Local Development

```bash
git clone https://github.com/Artem1981777/celosplit.git
cd celosplit
npm install
npm run dev
Deployed
App: https://celosplit.vercel.app
GitHub: https://github.com/Artem1981777/celosplit
Network: Celo Mainnet + Celo Sepolia Testnet
Builder
Built by @ArtemGromov777 for the Celo / MiniPay ecosystem.
