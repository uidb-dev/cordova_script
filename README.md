# cordova_script

Injects the right `cordova.js` `<script>` tag for the way your app is currently
running. It is an internal helper for the [`reco` CLI (`react.cordova`)](https://www.npmjs.com/package/react.cordova).

> **You probably don't want to install this directly.**
> `reco init` already adds it to new projects and wires up the import. There is no
> API, no exports, and no configuration — installing it by hand only makes sense if
> you are assembling a React + Cordova project without `reco`.

## What it actually does

Importing the package registers a `load` listener that appends a `<script>` tag
pointing at `cordova.js`. The only thing it decides is the URL:

| Condition | `cordova.js` resolved from |
| --- | --- |
| `NODE_ENV === "production"` **and** `"serviceWorker" in navigator` | `<PUBLIC_URL>/cordova.js` — the copy Cordova itself injects into the packaged app |
| Anything else | `http://<host>:8597/browser/www<PUBLIC_URL>/cordova.js` — served by `cordova serve 8597`, which `reco start` runs for you |

Note that the production path is gated on **both** conditions, so a production build
running where `navigator.serviceWorker` is unavailable falls back to the localhost dev
URL.

That is the whole package: about thirty lines, no dependencies, no exports. It also
appends an HTML comment to the document body so you can see where the tag came from
when reading the DOM.

## Usage

Import it once, for its side effect, before you mount your app — then wait for
Cordova's `deviceready` event:

```jsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "cordova_script"; // side-effect import: injects cordova.js

document.addEventListener(
  "deviceready",
  () => {
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  },
  false
);
```

This is exactly what the `reco` project template generates.

## Install

```bash
npm install cordova_script
```

Expects a bundler that substitutes `process.env.NODE_ENV` and `process.env.PUBLIC_URL`
(Create React App, Webpack, and similar). Port `8597` is hard-coded to match the dev
server `reco` starts.

## License

ISC © [ui-db.com](https://ui-db.com)
