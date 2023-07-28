git commit -m "installs node@14.17.6 b/c node-sass & crypto complains" -m 'I installed `npm install node@14.17.6 --save-exact`. I think subsequent `node install` should use exact node version because the former added `"node": "14.17.6",` as a dependency in `package.json`
For a more recent node version two things need to happen:
- `node-sass` complained, so needs to be replaced with `sass` (e.g."^1.64.1") which is implemented with dart (pure-JavaScript package built from the Dart Sass)
- node 17 needs openSSL dependency for crypto module (is used by webpack server or sth like that). I could consider moving to vite instead of webpack
https://github.com/facebook/create-react-app/issues/11708
https://stackoverflow.com/questions/73144960/error-error0308010cdigital-envelope-routinesunsupported-at-new-hash-nodei