function _0xdacc() {
  const _0x241ba6 = [
    "style",
    "querySelector",
    "value",
    "rgb(236,\x20118,\x20118)",
    "Erro:\x20",
    "input[type=\x22password\x22]",
    "senha",
    "/usuarios",
    "1312178LnqWeK",
    "textContent",
    "Login\x20bem-sucedido!",
    "2nDbnXM",
    "334359evTtsF",
    "click",
    "exists",
    "1148874QyMPvV",
    "codigoEmpresa",
    "usuario",
    ".submit",
    "Por\x20favor,\x20preencha\x20todos\x20os\x20campos.",
    "trim",
    "39020klxkyh",
    "137742HdgXVd",
    "index.html",
    "val",
    "rgb(76,\x20175,\x2080)",
    "href",
    "665328iLzkXO",
    "addEventListener",
    "color",
    "Usuário\x20não\x20encontrado\x20ou\x20senha\x20incorreta.",
    "setItem",
    "preventDefault",
    "1177648LCefdm",
    "Verifique\x20seu\x20e-mail.",
  ];
  _0xdacc = function () {
    return _0x241ba6;
  };
  return _0xdacc();
}
const _0x16aee1 = _0x41ee;
(function (_0x493345, _0x4afc6a) {
  const _0x4e3ca0 = _0x41ee,
    _0x4e6af6 = _0x493345();
  while (!![]) {
    try {
      const _0x1407ef =
        -parseInt(_0x4e3ca0(0x183)) / 0x1 +
        (parseInt(_0x4e3ca0(0x178)) / 0x2) *
          (-parseInt(_0x4e3ca0(0x179)) / 0x3) +
        -parseInt(_0x4e3ca0(0x188)) / 0x4 +
        parseInt(_0x4e3ca0(0x182)) / 0x5 +
        parseInt(_0x4e3ca0(0x17c)) / 0x6 +
        parseInt(_0x4e3ca0(0x175)) / 0x7 +
        parseInt(_0x4e3ca0(0x18e)) / 0x8;
      if (_0x1407ef === _0x4afc6a) break;
      else _0x4e6af6["push"](_0x4e6af6["shift"]());
    } catch (_0x2928b4) {
      _0x4e6af6["push"](_0x4e6af6["shift"]());
    }
  }
})(_0xdacc, 0x1ce90);
import { auth, database } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
const submitBtn = document["querySelector"](_0x16aee1(0x17f)),
  userInput = document[_0x16aee1(0x191)]("input[type=\x22text\x22]"),
  passwordInput = document[_0x16aee1(0x191)](_0x16aee1(0x172)),
  messageField = document[_0x16aee1(0x191)](".label-message");
function _0x41ee(_0x4b5d11, _0x2f4d4a) {
  const _0xdacc39 = _0xdacc();
  return (
    (_0x41ee = function (_0x41eedd, _0x389ef9) {
      _0x41eedd = _0x41eedd - 0x170;
      let _0xbfd3c4 = _0xdacc39[_0x41eedd];
      return _0xbfd3c4;
    }),
    _0x41ee(_0x4b5d11, _0x2f4d4a)
  );
}
submitBtn[_0x16aee1(0x189)](_0x16aee1(0x17a), async function (_0x33f484) {
  const _0x18f09c = _0x16aee1;
  _0x33f484[_0x18f09c(0x18d)]();
  const _0xa44d5e = userInput[_0x18f09c(0x192)][_0x18f09c(0x181)](),
    _0x1bc180 = passwordInput[_0x18f09c(0x192)][_0x18f09c(0x181)]();
  if (!_0xa44d5e || !_0x1bc180) {
    displayMessage(_0x18f09c(0x180), "rgb(236,\x20118,\x20118)");
    return;
  }
  try {
    const {
      userEmail: _0x236895,
      userUID: _0x191d4f,
      codigoEmpresa: _0x2748fa,
    } = await findUserInDatabase(_0xa44d5e, _0x1bc180);
    if (!_0x236895) throw new Error(_0x18f09c(0x18b));
    const _0x538922 = await signInWithEmailAndPassword(
        auth,
        _0x236895,
        _0x1bc180
      ),
      _0x52410a = _0x538922["user"];
    if (!_0x52410a["emailVerified"]) {
      displayMessage(_0x18f09c(0x18f), "rgb(236,\x20118,\x20118)");
      return;
    }
    localStorage[_0x18f09c(0x18c)]("userUID", _0x191d4f),
      localStorage[_0x18f09c(0x18c)](_0x18f09c(0x17d), _0x2748fa),
      displayMessage(_0x18f09c(0x177), _0x18f09c(0x186)),
      setTimeout(
        () => (window["location"][_0x18f09c(0x187)] = _0x18f09c(0x184)),
        0x5dc
      );
  } catch (_0x5b6ce2) {
    displayMessage(_0x18f09c(0x171) + _0x5b6ce2["message"], _0x18f09c(0x170));
  }
});
async function findUserInDatabase(_0xd7ad2d, _0x2724c0) {
  const _0x272a22 = _0x16aee1,
    _0x1a7dc8 = ref(database),
    _0x55ddac = await get(_0x1a7dc8);
  if (!_0x55ddac[_0x272a22(0x17b)]())
    throw new Error(
      "Dados\x20não\x20encontrados\x20no\x20banco\x20de\x20dados."
    );
  const _0x32f29c = _0x55ddac["val"]();
  let _0x5197c9 = null,
    _0x51f662 = null,
    _0x2ae2ad = null;
  for (const _0x4d8ddb in _0x32f29c) {
    const _0x29eab6 = child(_0x1a7dc8, _0x4d8ddb + _0x272a22(0x174)),
      _0x242538 = await get(_0x29eab6);
    if (_0x242538["exists"]()) {
      const _0xeae18d = _0x242538[_0x272a22(0x185)]();
      for (const _0x426ffb in _0xeae18d) {
        const _0x5c33bb = _0xeae18d[_0x426ffb];
        if (
          _0x5c33bb[_0x272a22(0x17e)] === _0xd7ad2d &&
          _0x5c33bb[_0x272a22(0x173)] === _0x2724c0
        ) {
          (_0x5197c9 = _0x5c33bb["email"]),
            (_0x51f662 = _0x426ffb),
            (_0x2ae2ad = _0x4d8ddb);
          break;
        }
      }
      if (_0x5197c9) break;
    }
  }
  return { userEmail: _0x5197c9, userUID: _0x51f662, codigoEmpresa: _0x2ae2ad };
}
function displayMessage(_0x1ac0c2, _0xd7f064) {
  const _0x189bcf = _0x16aee1;
  (messageField[_0x189bcf(0x176)] = _0x1ac0c2),
    (messageField[_0x189bcf(0x190)][_0x189bcf(0x18a)] = _0xd7f064);
}
