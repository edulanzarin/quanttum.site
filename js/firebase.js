function _0x56cb(_0x5109c4, _0x2f93c8) {
  const _0x1ae049 = _0x1ae0();
  return (
    (_0x56cb = function (_0x56cb6b, _0x21a2b7) {
      _0x56cb6b = _0x56cb6b - 0xe0;
      let _0x5ab308 = _0x1ae049[_0x56cb6b];
      return _0x5ab308;
    }),
    _0x56cb(_0x5109c4, _0x2f93c8)
  );
}
const _0x2fe133 = _0x56cb;
(function (_0x28f7e7, _0x47621e) {
  const _0xa788dd = _0x56cb,
    _0x4d8652 = _0x28f7e7();
  while (!![]) {
    try {
      const _0x5c93b8 =
        parseInt(_0xa788dd(0xe9)) / 0x1 +
        (parseInt(_0xa788dd(0xe3)) / 0x2) * (-parseInt(_0xa788dd(0xe1)) / 0x3) +
        -parseInt(_0xa788dd(0xe6)) / 0x4 +
        parseInt(_0xa788dd(0xe8)) / 0x5 +
        parseInt(_0xa788dd(0xeb)) / 0x6 +
        parseInt(_0xa788dd(0xe0)) / 0x7 +
        -parseInt(_0xa788dd(0xee)) / 0x8;
      if (_0x5c93b8 === _0x47621e) break;
      else _0x4d8652["push"](_0x4d8652["shift"]());
    } catch (_0x12e511) {
      _0x4d8652["push"](_0x4d8652["shift"]());
    }
  }
})(_0x1ae0, 0x84e25);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
const firebaseConfig = {
    apiKey: _0x2fe133(0xe7),
    authDomain: _0x2fe133(0xea),
    projectId: _0x2fe133(0xe5),
    storageBucket: _0x2fe133(0xed),
    messagingSenderId: _0x2fe133(0xec),
    appId: _0x2fe133(0xe4),
    measurementId: _0x2fe133(0xe2),
  },
  app = initializeApp(firebaseConfig),
  auth = getAuth(app),
  database = getDatabase(app),
  storage = getStorage(app);
function _0x1ae0() {
  const _0x3bb942 = [
    "9yssVIc",
    "G-5RZM4HERL8",
    "460738zFKyyi",
    "1:223565529814:web:d992bd60cba7aadb54ff77",
    "quanttum-site",
    "12436AviURi",
    "AIzaSyDWgjOPqQZr4A8YlnwOQpr3n_JWncLZOmk",
    "1233200ErgaPu",
    "1034695IsiuPz",
    "quanttum-site.firebaseapp.com",
    "230172OOEHCd",
    "223565529814",
    "quanttum-site.appspot.com",
    "7386688BmHDrH",
    "5895036rIkfvJ",
  ];
  _0x1ae0 = function () {
    return _0x3bb942;
  };
  return _0x1ae0();
}
export {
  auth,
  database,
  storage,
  createUserWithEmailAndPassword,
  sendEmailVerification,
};
