# Big Thanks to [Marmota](https://github.com/jaimeadf) for giving me the necessary files to convert it 
# @vrpjs0.5/server

A bridge for using [FiveM](http://fivem.net/) [vRP 0.5](https://github.com/ImagicTheCat/vRP/tree/0.5) in JavaScript.

## Installation

It is done via the [`npm install` command](https://docs.npmjs.com/downloading-and-installing-packages-locally):

> npm install @vrpjs/server

## Usage

```javascript
const { VrpProxy, VrpTunnel } = require('@vrpjs0.5/server');

const vRP = VrpProxy.getInterface('vRP');
const vRPClient = VrpTunnel.getInterface('vRP');

on('vRP:playerSpawn', async (userId, player, firstSpawn) => {
    if (firstSpawn) {
        vRP.request(player, 'Do you want money?', 20, async (v,ok)  =>{
        if (ok){
            vRP.giveMoney(userId, 1000);
            vRPClient.notify(player, `You now have ~g~$${vRP.getMoney(userId)}!`);
        } else {
            const position = await vRPClient.getPosition(player);
            vRPClient.notify(player, `You recused money at ~b~${position.join('~s~, ~b~')}~s~!`);
        }
    })
    }
});
```