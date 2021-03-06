"use strict";

const monsterPosition = [];
const workField = [];
const playerPosition = [];
const direction = [0, 0];
const lastDirection = [0, 1];
const bomb = "B";
const freeField = " ";
const monster = "M";
const block = "&#9608;";
const player = "P";
const fire = "F";
const box = "&#9617;";

var gameInterval;
var fieldY;
var fieldX;
var enemies;
var place;
var playing;

const startButton = document.getElementById("startButton");

function validate(name, info, min, max) { // проверяем вводимые данные
  if (info >= min && info <= max) {
    return true;
  } else {
    alert(`Please input correct ${name} (between ${min} and ${max})`);
    return false;
  }
}

startButton.addEventListener("click", (e) => { // вешаем запуск игры на startbutton
  if (!playing){
  fieldX = Math.round(Number(document.getElementById("fieldX").value)) || 40;
  fieldY = Math.round(Number(document.getElementById("fieldY").value)) || 20;
  enemies = Number(document.getElementById("enemies").value) || 10;
  if (
    validate("fieldX", fieldX, 10, 60) &&
    validate("fieldY", fieldY, 10, 20) &&
    validate("enemies", enemies, 1, 15)
  ) {
    gameStart();
    playing = true;
  }
}
});

function gameStart() {              // запуск игры, случайное заполнение игрового поля, скрытие лишних элементов
  for (let i = 0; i < enemies; i++) {
    monsterPosition[i] = new Array(3);
    monsterPosition[i][0] = getRandom(1, fieldY);
    monsterPosition[i][1] = getRandom(1, fieldX);
    monsterPosition[i][2] = "Active";
  }

  playerPosition[0] = Number(getRandom(1, fieldY));
  playerPosition[1] = Number(getRandom(1, fieldX));
  playerPosition[2] = "Alive";

  for (let i = 0; i < fieldY + 2; i++) {
    workField[i] = new Array(fieldX + 2);
    for (let j = 0; j < fieldX + 2; j++) {
      if (i === 0 || j === 0 || i === fieldY + 1 || j === fieldX + 1) {
        workField[i][j] = block;
      } else {
        if (monsterPosition.some((item) => item[0] === i && item[1] === j)) {
          workField[i][j] = monster;
        } else if (getRandom(0, 0.545)) {
          workField[i][j] = block;
        } else if (getRandom(0, 0.6)) {
          workField[i][j] = box;
        } else {
          workField[i][j] = freeField;
        }
      }
    }
  }

  workField[playerPosition[0]][playerPosition[1]] = player;
  createField();
  document.getElementById("status").innerText = "Playing";
  document.getElementById("startButton").style.visibility = "hidden";
  gameInterval = setInterval(() => runningGame(), 500);
}

function createField() {       // отрисовываем поле с 0
  workField.map((item) => {
    const array = document.createElement("div");
    array.innerHTML = item.join("");
    document.getElementById("app").appendChild(array);
  });
}

function updateField() {    // обновляем поле после каждого хода
  workField.map((item) => {
    const array = document.createElement("div");
    array.innerHTML = item.join("");
    const app = document.getElementById("app").childNodes[
      workField.indexOf(item)
    ];
    document.getElementById("app").replaceChild(array, app);
  });
}

function clearField() {      // убираем поле после окончания игры
  workField.map(() => {
    document.getElementById("app").firstChild.remove();
  });
}

function getRandom(min, max) {     // функция для получения вероятности хода, заполнения поля и т.п.
  return Math.round(Math.random() * (max - min) + min);
}

function runningGame() {
  // процесс прохождения хода
  updatePlayerPosition(); // обновляем позицию игрока по результату нажатия клавиши

  monsterThinks(); // монстры выбирают дальнейший путь

  monsterMove(); // монстры ходят

  bombSequence(); // если был нажат пробел - срабатывает установка бомбы

  updateField(); // ообновляем поле после каждого хода

  if (!monsterPosition.some((item) => item[2] !== "Dead")) {     // проверка на победу или поражение
    document.getElementById("status").innerText = "Victory";
  }
  if (playerPosition[2] === "Killed") {
    document.getElementById("status").innerText = "Defeat";
  }
  if ( // события завершения игры
    document.getElementById("status").innerText === "Defeat" ||
    document.getElementById("status").innerText === "Victory"
  ) {
    clearInterval(gameInterval);
    setTimeout(() => {
      playing = false;
      clearField();
      document.getElementById("startButton").style.visibility = "visible";
    }, 2500);
  }
}

function monsterThinks() {      // монстр определяет куда он будет ходить
  monsterPosition.map((item) => {
    if (item[2] !== "Dead") {
      let nextStepY = item[0] + getRandom(-1, 1);
      let nextStepX = item[1] + getRandom(-1.49, 1.49);
      if (workField[item[0]][item[1]] === monster) {
        workField[item[0]][item[1]] = freeField;
      }
      if (
        nextStepY > 0 &&
        nextStepY < fieldY &&
        !monsterPosition.some(
          (it) => it[0] === nextStepY && it[1] === item[1]
        ) &&
        workField[nextStepY][item[1]] !== block &&
        workField[nextStepY][item[1]] !== box &&
        workField[nextStepY][item[1]] !== bomb
      ) {
        item[0] = nextStepY;
      } else if (
        nextStepX > 0 &&
        nextStepX < fieldX &&
        !monsterPosition.some((it) => it[1] === nextStepX) &&
        workField[item[0]][nextStepX] !== block &&
        workField[item[0]][nextStepX] !== box &&
        workField[item[0]][nextStepX] !== bomb
      ) {
        item[1] = nextStepX;
      }
    }
  });
}
function monsterMove() {          // монстер ходит и умирает/ест игрока если может
  monsterPosition.map((item) => {
    let a = workField[item[0]][item[1]];
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

function updatePlayerPosition() {     // игрок ходит по результатам нажатия клавиш
  if (playerPosition[2] === "Alive") {
    let a =
      workField[playerPosition[0] + direction[0]][
        playerPosition[1] + direction[1]
      ];
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

function bombSequence() {    //процесс установки бомбы
  if (place) {
    if (
      workField[playerPosition[0] + lastDirection[0]][
        playerPosition[1] + lastDirection[1]
      ] !== block &&
      workField[playerPosition[0] + lastDirection[0]][
        playerPosition[1] + lastDirection[1]
      ] !== box
    ) {
      workField[playerPosition[0] + lastDirection[0]][
        playerPosition[1] + lastDirection[1]
      ] = bomb;
      bombExplodes( // процесс взрыва бомбы с задержкой
        playerPosition[0] + lastDirection[0],
        playerPosition[1] + lastDirection[1]
      );
    }
  }
  place = false;
}

function bombExplodes(y, x) {
  // процесс взрыва бомбы с задержкой в координатах ее установки
  setTimeout(() => {
    const bombZone = [
      [y + 1, x],
      [y + 2, x],
      [y + 3, x],
      [y - 1, x],
      [y - 2, x],
      [y - 3, x],
      [y, x + 1],
      [y, x + 2],
      [y, x + 3],
      [y, x - 1],
      [y, x - 2],
      [y, x - 3],
    ];

    bombZone.map((item, index, array) => {
      let a = array[index - 1];
      let indexCheck = [0, 3, 6, 9].some((it) => it === index);

      if (
        item[0] > 0 &&
        item[0] < fieldY + 1 &&
        item[1] > 0 &&
        item[1] < fieldX + 1
      ) {
        if (    // проверка на проход огня через стены и на убийство взрывом игрока/монстров
          (indexCheck && workField[item[0]][item[1]] !== block) ||
          (!indexCheck &&
            workField[a[0]][a[1]] === fire &&
            workField[item[0]][item[1]] !== block)
        ) {
          workField[item[0]][item[1]] = fire;
          if (workField[item[0]][item[1]] === player) {
            playerPosition[2] = "Killed";
            workField[item[0]][item[1]] = fire;
          }
          if (workField[item[0]][item[1]] === monster) {
            monsterPosition.find(
              (it) => it[0] === item[0] && it[1] === item[1]
            )[2] = "Dead";
            workField[item[0]][item[1]] = fire;
          }
          setTimeout(() => {
            if (
              workField[item[0]][item[1]] !== bomb &&
              workField[item[0]][item[1]] !== block
            ) {
              workField[item[0]][item[1]] = freeField;
            }
          }, 1500);
        }
      }
    });
    workField[y][x] = fire;
    setTimeout(() => {
      workField[y][x] = freeField;
    }, 1500);
  }, 3000);
}

document.addEventListener("keydown", (e) => {  // реализация управления за счет нажатия клавишь
  const keyName = e.key;

  switch (keyName) {
    case "w": {
      direction[0] = -1;
      direction[1] = 0;
      break;
    }
    case "a": {
      direction[0] = 0;
      direction[1] = -1;
      break;
    }
    case "s": {
      direction[0] = 1;
      direction[1] = 0;
      break;
    }
    case "d": {
      direction[0] = 0;
      direction[1] = 1;
      break;
    }
    case " ": {
      direction[0] = 0;
      direction[1] = 0;
      place = true;
      break;
    }
  }
});