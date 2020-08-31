<h1 align="center">
  Next App Shell
</h1>

<p align="center">
  <i>Truly-offline Progressive Web Apps with NextJS</i>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/next-app-shell">
    <img src="https://img.shields.io/npm/dy/next-app-shell.svg">
  </a>
  <a href="https://www.npmjs.com/package/next-app-shell">
    <img src="https://img.shields.io/npm/v/next-app-shell.svg?maxAge=3600&label=next-app-shell&colorB=007ec6">
  </a>
  <img src="https://img.shields.io/github/repo-size/hozana/next-app-shell.svg" />
</p>

<br/>

## What is this about ?

The [next-offline](https://github.com/hanford/next-offline) package provides integration with [Workbox](https://developers.google.com/web/tools/workbox) to ease the generation of the service worker, but it doesn't offer a true Progressive Web App experience: it caches pages as the user navigates through the website, but if the user goes offline and go to a page which hasn't been cached, it will fail. 

Furthermore, the cache space is potentially important since the whole HTML files are cached. This can be a problem if we have, for example, a blog with hundreds of posts. In this case, we would prefer to cache only the [app shell](https://developers.google.com/web/fundamentals/architecture/app-shell) and load the data dynamically (eventually caching the API calls).

With `next-app-shell`, one [app shell](https://developers.google.com/web/fundamentals/architecture/app-shell) is generated for each NextJS page. This way, wherever your user goes, it will always be possible to show him something.

> **This plugin has only been tested with NextJS 9.4.2**. As we had to do some kind of "reverse engineering" to make this work, new versions of NextJS may break the code. Please see the known issues below.


## Installation

```
yarn add next-app-shell next-offline
```
or
```
npm install next-app-shell next-offline --save
```


## Usage

```js
const path = require('path');
const withOffline = require('next-offline');
const withAppShell = require('next-app-shell');

module.exports = withAppShell(
  withOffline({
      // Configure the service worker generation
      // See https://github.com/hanford/next-offline for the details
      generateSw: false,
      workboxOpts: {
        swSrc: path.resolve(__dirname, 'sw.js'),
        swDest: './sw.js'
      },
    
      // Configure the app shell files generation
      appShell : {
        nextPages: ['home', 'contact'],
        template: path.resolve(__dirname, 'app-shell.ejs')
      }
    })
);
```


## Service worker configuration

In the service worker file, you need to map your routes to the app shell files, so that when the user goes to a certain route, he arrive .

With Workbox it can be done quite easily with the [registerNavigationRoute](https://developers.google.com/web/tools/workbox/modules/workbox-routing#how_to_register_a_navigation_route) method.

```js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

const pages = ['home', 'contact'];

// Prepare all the generated app shells
const appShells = pages.map(pageKey => ({
  url: `/app-shell/${pageKey}.html`,
  revision: Date.now().toString()
}));

// Depending on your routes, you may need to adapt the regex
appShells.forEach(appShell => {
  workbox.routing.registerNavigationRoute(
    appShell.url,
    { whitelist: new RegExp(`^\/${pageKey}`, 'i') }
  );
});

// __precacheManifest is populated by workbox-webpack-plugin on build time
// We also add the appShells since the service worker won't work without them
workbox.precaching.precacheAndRoute([...self.__precacheManifest, ...appShells]);
```


## Parameters

All the parameters are inside a `appShell` object (see example above)

- **nextPages** `string[]`

Array of page keys. They should be the same as the files in Next's `/pages` directory.

This parameter is mandatory.

- **template** `string`

Path to the .ejs template file used to generate the app shell files.

If none is provided, the [default template](./default-template.ejs) will be used.

- **filenameGenerator** `pageKey => string`

A function to generate the filename of the destination app shell file, given a page key.

Defaults to `pageKey => app-shell/${pageKey}.html`

- **htmlWebpackPluginOptions** `object`

Any other option that you want to pass to the [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin#options) which is used to generate the app shell file.


## Known issues

- When the service worker is activated, the `getInitialProps` method is never called. This means you need to do as if it doesn't exist.

- We add a `<meta name="next-head-count" content="1" />` in the header of each app shell, otherwise Next breaks. We currently don't know what this number is about and how we can generate it automatically for each page.


## Publish to NPM (admin only)

```
npm run release
```
