# @vrpjs/server

A bridge for using [FiveM](http://fivem.net/) [vRP 1.0](https://github.com/ImagicTheCat/vRP/tree/1.0) in JavaScript.

## Installation

It is done via the [`npm install` command](https://docs.npmjs.com/downloading-and-installing-packages-locally):

> npm install @vrpjs/server

## Usage

```javascript
const { VrpProxy, VrpTunnel } = require('@vrpjs/server');

const vRP = VrpProxy.getInterface('vRP');
const vRPClient = VrpTunnel.getInterface('vRP');

on('vRP:playerSpawn', async (userId, player, firstSpawn) => {
    if (firstSpawn) {
        if (await vRP.request(player, 'Do you want money?', 20)) {
            vRP.giveMoney(userId, 1000);
            vRPClient._notify(player, `You now have ~g~$${vRP.getMoney(userId)}!`);
        } else {
            const position = await vRPClient.getPosition(player);
            vRPClient._notify(player, `You recused money at ~b~${position.join('~s~, ~b~')}~s~!`);
        }
    }
});
```