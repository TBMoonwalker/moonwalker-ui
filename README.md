# moonwalker-ui

![title](design.jpg)

This steps should help get you started developing with Vue 3 in Vite.

## Project Setup

create a `src/config.ts`file with the following content:

export const MOONWALKER_API_PORT = 8150 (Port which is configured in Moonwalker)
export const MOONWALKER_API_HOST = window.location.hostname (or use a fix ip, dns name)

### Install module dependencies

```sh
npm install
```

### Compile and Hot-Reload for Development

### Running locally

```sh
npm run dev
```

### Running remote

```sh
npm run dev -- --host
```

then it is accessible by the: <moonloader-ui_serverIP>:5173


### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lightweight Chart Usage by Tradingview

TradingView Lightweight Charts™
Copyright (с) 2024 TradingView, Inc. https://www.tradingview.com/