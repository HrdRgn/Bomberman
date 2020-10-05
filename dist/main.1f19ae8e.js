// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.js":[function(require,module,exports) {
"use strict";

var monsterPosition = [];
var workField = [];
var playerPosition = [];
var direction = [0, 0];
var lastDirection = [0, 1];
var bomb = "B&#8200;&#8200;";
var freeField = "&#8195;";
var monster = "M&#8202;";
var block = "&#9609;";
var player = "P&#8196;&#8202;";
var fire = "F&#8202;&#8197;&#8202;";
var box = "&#9618;&#8198;&#8202;";
var gameInterval;
var fieldY;
var fieldX;
var enemies;
var place;
var startButton = document.getElementById("startButton");

function validate(name, info, min, max) {
  if (info >= min && info <= max) {
    return true;
  } else {
    alert("Please input correct ".concat(name, " (between ").concat(min, " and ").concat(max, ")"));
    return false;
  }
}

startButton.addEventListener("click", function (e) {
  fieldX = Math.round(Number(document.getElementById("fieldX").value)) || 30;
  fieldY = Math.round(Number(document.getElementById("fieldY").value)) || 20;
  enemies = Number(document.getElementById("enemies").value) || 10;

  if (validate("fieldX", fieldX, 10, 30) && validate("fieldY", fieldY, 10, 30) && validate("enemies", enemies, 1, 15)) {
    gameStart();
  }
});

function gameStart() {
  for (var i = 0; i < enemies; i++) {
    monsterPosition[i] = new Array(3);
    monsterPosition[i][0] = getRandom(1, fieldY);
    monsterPosition[i][1] = getRandom(1, fieldX);
    monsterPosition[i][2] = "Active";
  }

  playerPosition[0] = Number(getRandom(1, fieldY));
  playerPosition[1] = Number(getRandom(1, fieldX));
  playerPosition[2] = "Alive";

  var _loop = function _loop(_i) {
    workField[_i] = new Array(fieldX + 2);

    var _loop2 = function _loop2(j) {
      if (_i === 0 || j === 0 || _i === fieldY + 1 || j === fieldX + 1) {
        workField[_i][j] = block;
      } else {
        if (monsterPosition.some(function (item) {
          return item[0] === _i && item[1] === j;
        })) {
          workField[_i][j] = monster;
        } else if (getRandom(0, 0.565)) {
          workField[_i][j] = block;
        } else if (getRandom(1, 1.4)) {
          workField[_i][j] = box;
        } else {
          workField[_i][j] = freeField;
        }
      }
    };

    for (var j = 0; j < fieldX + 2; j++) {
      _loop2(j);
    }
  };

  for (var _i = 0; _i < fieldY + 2; _i++) {
    _loop(_i);
  }

  workField[playerPosition[0]][playerPosition[1]] = player;
  createField();
  document.getElementById("status").innerText = playerPosition[2];
  document.getElementById("startButton").style.visibility = "hidden";
  gameInterval = setInterval(function () {
    return runningGame();
  }, 500);
}

function createField() {
  workField.map(function (item) {
    var array = document.createElement("div");
    array.innerHTML = item.join("");
    document.getElementById("app").appendChild(array);
  });
}

function updateField() {
  workField.map(function (item) {
    var array = document.createElement("div");
    array.innerHTML = item.join("");
    var app = document.getElementById("app").childNodes[workField.indexOf(item)];
    document.getElementById("app").replaceChild(array, app);
  });
}

function clearField() {
  workField.map(function () {
    document.getElementById("app").firstChild.remove();
  });
}

function getRandom(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function runningGame() {
  updatePlayerPosition();
  monsterThinks();
  monsterMove();
  bombSequence();
  document.getElementById("status").innerText = playerPosition[2];
  updateField();

  if (!monsterPosition.some(function (item) {
    return item[2] !== "Dead";
  })) {
    document.getElementById("status").innerText = "Victory";
  }

  if (playerPosition[2] === "Killed") {
    document.getElementById("status").innerText = "Defeat";
  }

  if (document.getElementById("status").innerText === "Defeat" || document.getElementById("status").innerText === "Victory") {
    clearInterval(gameInterval);
    setTimeout(function () {
      clearField();
      document.getElementById("startButton").style.visibility = "visible";
    }, 2500);
  }
}

function monsterThinks() {
  monsterPosition.map(function (item) {
    if (item[2] !== "Dead") {
      var nextStepY = item[0] + getRandom(-1, 1);
      var nextStepX = item[1] + getRandom(-1.49, 1.49);

      if (workField[item[0]][item[1]] === monster) {
        workField[item[0]][item[1]] = freeField;
      }

      if (nextStepY > 0 && nextStepY < fieldY && !monsterPosition.some(function (it) {
        return it[0] === nextStepY && it[1] === item[1];
      }) && workField[nextStepY][item[1]] !== block && workField[nextStepY][item[1]] !== box && workField[nextStepY][item[1]] !== bomb) {
        item[0] = nextStepY;
      } else if (nextStepX > 0 && nextStepX < fieldX && !monsterPosition.some(function (it) {
        return it[1] === nextStepX;
      }) && workField[item[0]][nextStepX] !== block && workField[item[0]][nextStepX] !== box && workField[item[0]][nextStepX] !== bomb) {
        item[1] = nextStepX;
      }
    }
  });
}

function monsterMove() {
  monsterPosition.map(function (item) {
    var a = workField[item[0]][item[1]];

    if (a === fire) {
      item[2] = "Dead";
    } else if (item[2] !== "Dead") {
      if (a === player) {
        playerPosition[2] = "Killed";
        workField[item[0]][item[1]] = monster;
      } else {
        workField[item[0]][item[1]] = monster;
      }
    }
  });
}

function updatePlayerPosition() {
  if (playerPosition[2] === "Alive") {
    var a = workField[playerPosition[0] + direction[0]][playerPosition[1] + direction[1]];

    if (a !== block && a !== bomb && a !== box) {
      if (a === monster || a === fire) {
        playerPosition[2] = "Killed";
      }

      if (direction[0] !== 0 || direction[1] !== 0) {
        workField[playerPosition[0]][playerPosition[1]] = freeField;
        playerPosition[0] += direction[0];
        playerPosition[1] += direction[1];
        workField[playerPosition[0]][playerPosition[1]] = player;
        lastDirection[0] = direction[0];
        lastDirection[1] = direction[1];
      }

      direction[0] = 0;
      direction[1] = 0;
    }
  }
}

function bombSequence() {
  if (place) {
    if (workField[playerPosition[0] + lastDirection[0]][playerPosition[1] + lastDirection[1]] !== block && workField[playerPosition[0] + lastDirection[0]][playerPosition[1] + lastDirection[1]] !== box) {
      workField[playerPosition[0] + lastDirection[0]][playerPosition[1] + lastDirection[1]] = bomb;
      bombExplodes(playerPosition[0] + lastDirection[0], playerPosition[1] + lastDirection[1]);
    }
  }

  place = false;
}

function bombExplodes(y, x) {
  setTimeout(function () {
    var bombZone = [[y + 1, x], [y + 2, x], [y + 3, x], [y - 1, x], [y - 2, x], [y - 3, x], [y, x + 1], [y, x + 2], [y, x + 3], [y, x - 1], [y, x - 2], [y, x - 3]];
    bombZone.map(function (item, index, array) {
      var a = array[index - 1];
      var indexCheck = [0, 3, 6, 9].some(function (it) {
        return it === index;
      });

      if (item[0] > 0 && item[0] < fieldY + 1 && item[1] > 0 && item[1] < fieldX + 1) {
        if (indexCheck && workField[item[0]][item[1]] !== block || !indexCheck && workField[a[0]][a[1]] === fire && workField[item[0]][item[1]] !== block) {
          workField[item[0]][item[1]] = fire;

          if (workField[item[0]][item[1]] === player) {
            playerPosition[2] = "Killed";
            workField[item[0]][item[1]] = fire;
          }

          if (workField[item[0]][item[1]] === monster) {
            monsterPosition.find(function (it) {
              return it[0] === item[0] && it[1] === item[1];
            })[2] = "Dead";
            workField[item[0]][item[1]] = fire;
          }

          setTimeout(function () {
            if (workField[item[0]][item[1]] !== bomb && workField[item[0]][item[1]] !== block) {
              workField[item[0]][item[1]] = freeField;
            }
          }, 1500);
        }
      }
    });
    workField[y][x] = fire;
    setTimeout(function () {
      workField[y][x] = freeField;
    }, 1500);
  }, 3000);
}

document.addEventListener("keydown", function (e) {
  var keyName = e.key;

  switch (keyName) {
    case "w":
      {
        direction[0] = -1;
        direction[1] = 0;
        break;
      }

    case "a":
      {
        direction[0] = 0;
        direction[1] = -1;
        break;
      }

    case "s":
      {
        direction[0] = 1;
        direction[1] = 0;
        break;
      }

    case "d":
      {
        direction[0] = 0;
        direction[1] = 1;
        break;
      }

    case " ":
      {
        direction[0] = 0;
        direction[1] = 0;
        place = true;
        break;
      }
  }
});
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54834" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map