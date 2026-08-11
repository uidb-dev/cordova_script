# Changelog

All notable changes to `cordova_script` are documented here.

## 1.2.0 — 2026-08-11

### ⚠️ Removed published files (read this if you deep-import)

The published tarball previously contained files that this package does not use
and does not own. They are gone as of 1.2.0. **The only published entry point is
now `cordova_script` (→ `dist/index.js`).**

Paths that existed in 1.1.0 and no longer exist:

| Removed path                 | Was | Why it is gone |
| ---------------------------- | --- | -------------- |
| `dist/animate.css`           | 77.7 kB | Vendored third-party CSS (animate.css 3.7.0, © 2018 Daniel Eden, MIT). Belongs to `mobile-navigation-controller`, which ships and attributes it properly. Shipping it here put MIT-licensed code inside an ISC package with no attribution, and it was 96% of the tarball. |
| `dist/styles.css`            | 968 B | Vendored copy of `navigationController.css` 1.0.3 — again the property of `mobile-navigation-controller`, not of this package. |
| `dist/corodva_URL`           | 21 B | A stray test fixture containing the literal text `test from corodva_URL` (filename typo included). Never referenced by anything. |
| `dist/jquery-3.3.1.min.js`   | 86 kB | Vendored jQuery 3.3.1, unused, affected by CVE-2019-11358 (prototype pollution). Removed earlier on this branch. |

None of these were ever imported by `dist/index.js`, by the `react.cordova` /
`reco` CLI, or by any generated app template — verified by grepping this repo,
`react.cordova` (templates, `bin/`, `dist/`), and every built app source map on
hand: the only `cordova_script/…` path any consumer bundle references is
`cordova_script/dist/index.js`.

Strictly speaking, removing a path that resolved in 1.1.0 is a breaking change,
and a deep import such as `import "cordova_script/dist/animate.css"` would now
fail. We judged that risk to be near zero — the package is a bare side-effect
import (`import "cordova_script";`), the CSS was never documented, never
referenced, and anyone who genuinely wanted animate.css would have installed
`animate.css` or `mobile-navigation-controller`.

**This is released as a minor, not a major, deliberately.** Every known consumer
pins `^1.x`. A major would reach none of them, which would leave the security
work below unadopted by exactly the installs it is meant to protect. If you do
deep-import one of the paths above, pin `cordova_script@1.1.0` and depend on
`mobile-navigation-controller` (or `animate.css`) directly for the stylesheets.

### Fixed

- **Production builds could load `cordova.js` from a localhost dev server.** The
  environment gate was
  `process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator`, copied
  from Create React App's service-worker registration boilerplate. Nothing in
  this package registers a service worker, and `navigator.serviceWorker` is
  undefined on `file://` and on the custom schemes used by iOS WKWebView and by
  cordova-android below 10 — i.e. precisely the packaged-app environments this
  shim exists for. A production build in such a WebView therefore took the
  *development* branch and injected a script tag pointing at
  `…:8597/browser/www/cordova.js` (and, from a `file://` document, at the
  nonsense URL `file:8597/browser/www/cordova.js`), so Cordova never
  initialised. The gate is now `process.env.NODE_ENV !== 'production'` for the
  dev URL only; production always resolves `cordova.js` relative to
  `process.env.PUBLIC_URL`.

  This cannot regress anyone: builds that previously took the production branch
  had `navigator.serviceWorker` present and are unaffected; builds that took the
  development branch by accident were already broken.

- Removed the `isLocalhost` constant, which was computed on every load and never
  read.

### Security

- Upgraded `webpack-dev-server` to 5.2.6 and migrated the build from Babel 6 to
  Babel 8 (`@babel/*`), replacing the abandoned `babel-*` 6.x toolchain.
- Dropped bogus runtime dependencies (`fs@0.0.1-security`, `path`) and isolated
  the dev webpack harness output to `.dev-build/` so it can never leak into the
  published tarball.
- Added a `files` allowlist to `package.json`.
- **`npm audit`: 45 vulnerabilities (36 critical, 3 high, 6 moderate) → 3
  (3 moderate).** An earlier note claiming a before-count of 74 was wrong: 74
  was a Dependabot alert *ID* misread as a count. The measured before-state,
  reproduced from the pre-branch `package.json`, is 45.

  The 3 remaining findings are one chain — `webpack-dev-server → sockjs → uuid`
  (GHSA-w5hq-g745-h8pq, missing buffer bounds check in uuid v3/v5/v6 when `buf`
  is supplied). All three are `devDependencies` only, reach no published code,
  and the vulnerable code path is not exercised. Clearing them requires
  `webpack-dev-server@6`, a breaking change to a dev-only harness; deferred.

- **`package-lock.json` is now committed.** It was previously in `.gitignore`,
  which meant the audited dependency tree existed on one machine and was
  reproducible for nobody — not CI, not the next maintainer. That gap undercut
  the point of the audit, so the ignore rule is removed and the lockfile is
  tracked.

### Changed

- Corrected the `repository`, `bugs`, and `homepage` fields to the real remote,
  `github.com/uidb-dev/cordova_script` (they pointed at `orchoban/`).

### Notes on the build output

`dist/index.js` is still ES5 — verified by parsing it with `acorn` at
`ecmaVersion: 5`, which rejects `const`/`let`/arrow functions/template
literals/classes outright. The package targets old Android WebViews
(`android 4.4`, `ios 9`, `chrome 30`).

The Babel 8 output no longer emits a `'use strict';` prologue that the 1.1.0
output had. This is inert for this file: it contains no `this`, `with`,
`arguments`, `eval`, octal literals, duplicate parameters, or unqualified
`delete`; it re-parses without error under a strict prologue; and its only
assignments are to a declared `var` and to writable properties of a
freshly-created `<script>` element. There is no construct here whose semantics
differ between sloppy and strict mode.

## 1.1.0

Previous release. See the git history.
