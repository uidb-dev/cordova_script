var cordovaScript_URL = "";

// In a production build the app is packaged inside the Cordova container, so
// cordova.js is served next to the app and a relative URL is correct.
// In any other build we point at the `cordova run browser` dev server.
//
// NOTE: this gate used to also require `'serviceWorker' in navigator`, copied
// from Create React App's service-worker registration boilerplate. That check
// is meaningless here (nothing registers a service worker) and actively
// harmful: `navigator.serviceWorker` is undefined on file:// and on the custom
// schemes used by iOS WKWebView and older cordova-android, so a *production*
// build in exactly the target environment fell through to the development
// branch and tried to load cordova.js from a localhost dev server.
if (process.env.NODE_ENV !== 'production') {
  cordovaScript_URL = document.URL.slice(0, document.URL.lastIndexOf(":")) + ":8597/browser/www";
}
window.addEventListener('load', function (e) {
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = "".concat(cordovaScript_URL + process.env.PUBLIC_URL, "/cordova.js");
  e.currentTarget.document.body.appendChild(document.createComment("This is an automatic switching src according to the run method. Comes from cordova_script"));
  e.currentTarget.document.body.appendChild(tag);
});