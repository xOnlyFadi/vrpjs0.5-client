# Big Thanks to [Marmota](https://github.com/jaimeadf) for giving me the necessary files to convert it 
# @vrpjs0.5/client

A bridge for using [FiveM](http://fivem.net/) [vRP 0.5](https://github.com/ImagicTheCat/vRP/tree/0.5) in JavaScript.

## Installation

It is done via the [`npm install` command](https://docs.npmjs.com/downloading-and-installing-packages-locally):

> npm install @vrpjs0.5/client

## Usage

> **Note:** This needs to be bundled to run using any module bundler of your choice, like [webpack](https://webpack.js.org).

```javascript
const { VrpProxy, VrpTunnel } = require('@vrpjs0.5/client');

const vRP = VrpProxy.getInterface('vRP');
const vRPServer = VrpTunnel.getInterface('vRP');

RegisterCommand('noclip', () => {
    vRP.toggleNoclip()
    vRPServer._varyHunger(-100);
    vRPServer._varyThirst(-100);
});
```