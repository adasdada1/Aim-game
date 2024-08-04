const board = document.querySelector(".gameField");
const startButton = document.querySelector(".start");
const title = document.querySelector(".gameover-title");
const coords = board.getBoundingClientRect();
const seconds = document.querySelector(".seconds");
const timer = document.querySelector(".timer");
const score = document.querySelector(".score");
const selection = document.querySelector(".selection");
const timeOfStart = document.querySelector(".timeOfStart");

let timerId;
let timerIdForStart;
const { width, height } = coords;

let num = 0;
let isRestart = false;
startButton.addEventListener("click", () => {
  timeOfStart.style.transform = "translateY(-100vh)";
  selection.style.transform = "translateY(0)";
  startButton.style.transform = "translateY(100vh)";
});

function boardClickHandler(e) {
  if (e.target.classList.contains("circle")) {
    e.target.remove();
    num++;
    score.textContent = num;
  } else if (e.target.tagName !== "BUTTON" && !isRestart) {
    gameOver();
  }
}

function boardUse() {
  board.removeEventListener("click", boardClickHandler);
  board.addEventListener("click", boardClickHandler);
}

seconds.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    setTimeOfStart();
    timeOfStart.style.transform = "translateY(0)";
    selection.style.transform = "translateY(100vh)";
    startButton.style.transform = "translateY(200vh)";
    const secs = e.target.dataset.sec;
    nullStart();
    timeOfStart.style.opacity = 1;
    setTimeout(() => {
      timeOfStart.style.transform = "translateY(100vh)";
    }, 2500);

    setTimeout(() => {
      timeOfStart.style.opacity = 0;
      updTimer(secs);
      start(secs, 50);
      boardUse();
    }, 3000);
  }
});

title.children[1].addEventListener("click", () => {
  isRestart = true;
  timeOfStart.style.transform = "translateY(-100vh)";

  selection.style.transform = "translateY(0)";
  title.classList.remove("gameover");
});

function start(secs, times) {
  for (let i = 0; i < times; i++) {
    setRandomCircles(secs);
  }
}

let index = 0;
function setRandomCircles(secs) {
  const size = getRandomNum(60, 20);
  const newCoords = getRandomCoord(size);
  const center = [newCoords[0] - size / 2, newCoords[1] - size / 2];

  for (let i = 0; i < board.children.length; i++) {
    const circleLeft = board.children[i].style.left.split("px")[0];
    const circleTop = board.children[i].style.top.split("px")[0];
    const coordsOfEveryCircle = [circleLeft - size / 2, circleTop - size / 2];

    if (
      center[0] - coordsOfEveryCircle[0] <= size * 2 + size / 2 &&
      center[0] - coordsOfEveryCircle[0] >= -(size * 2) + size / 2 &&
      center[1] - coordsOfEveryCircle[1] <= size * 2 + size / 2 &&
      center[1] - coordsOfEveryCircle[1] >= -(size * 2) + size / 2
    ) {
      return;
    }
  }

  const circle = document.createElement("div");
  circle.classList.add("circle");
  circle.classList.add("num" + index);
  index++;
  circle.style.left = newCoords[0] + "px";
  circle.style.top = newCoords[1] + "px";
  circle.style.width = size + "px";
  circle.style.height = size + "px";
  circle.style.animationDuration = getRandomNum(3, 10) + "s";
  board.append(circle);
  const animationEndHandler = createAnimationEndHandler(circle, secs);
  circle.addEventListener("animationend", animationEndHandler);

  circle.animationEndHandler = animationEndHandler;
}

function getRandomCoord(size) {
  const newStart = Math.random() * (width - size);
  const newEnd = Math.random() * (height - size);
  return [newStart, newEnd];
}

function getRandomNum(max, min) {
  return Math.floor(Math.random() * (max - min) + min);
}

function againCircle(circle, secs) {
  circle.remove();
  const times = getRandomNum(1, 20);
  start(secs, times);
}

function updTimer(secs) {
  isRestart = false;
  timer.textContent = secs;
  timerId = setInterval(() => {
    timer.textContent -= 1;
    if (parseInt(timer.textContent) === 0) {
      clearInterval(timerId);
      gameOver();
    }
  }, 1000);
}

function gameOver() {
  clearInterval(timerId);
  const circles = document.querySelectorAll(".circle");
  circles.forEach((circle) => {
    if (circle.animationEndHandler) {
      circle.removeEventListener("animationend", circle.animationEndHandler);
      circle.style.pointerEvents = "none";
    }
  });
  title.children[0].innerHTML = `Ваш счет: ${num}`;
  title.classList.add("gameover");
}

function nullStart() {
  num = 0;
  timer.textContentF;
  score.textContent = 0;
  timer.textContent = "00";
  title.classList.remove("gameover");
  title.children[0].innerHTML = `Ваш счет: 0`;
  const circles = document.querySelectorAll(".circle");
  circles.forEach((circle) => {
    if (circle.animationEndHandler) {
      circle.style.pointerEvents = "all";
      circle.remove();
    }
  });
}

function createAnimationEndHandler(circle, secs) {
  return function () {
    againCircle(circle, secs);
  };
}

function setTimeOfStart() {
  timeOfStart.children[0].textContent = 3;
  timerIdForStart = setInterval(() => {
    timeOfStart.children[0].textContent -= 1;
    if (parseInt(timeOfStart.children[0].textContent) === 1) {
      clearInterval(timerIdForStart);
    }
  }, 1000);
}
