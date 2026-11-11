const SIZE = 15;

const mazeElement = document.getElementById('maze');
const stepsElement = document.getElementById('steps');
const messageElement = document.getElementById('message');
const newMazeButton = document.getElementById('newMaze');

let cells = [];
let player = { x: 0, y: 0 };
let steps = 0;
let gameFinished = false;

// Напрямки руху

const directions = [
  { name: 'top', dx: 0, dy: -1, opposite: 'bottom' },
  { name: 'right', dx: 1, dy: 0, opposite: 'left' },
  { name: 'bottom', dx: 0, dy: 1, opposite: 'top' },
  { name: 'left', dx: -1, dy: 0, opposite: 'right' }
];

// Створення клітинок

function createCells() {
  cells = [];

  for (let y = 0; y < SIZE; y++) {
    const row = [];

    for (let x = 0; x < SIZE; x++) {
      row.push({
        x,
        y,
        visited: false,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true
        }
      });
    }

    cells.push(row);
  }
}

// Перемішування напрямків

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Генерація випадкового лабіринту

function generateMaze() {
  createCells();

  const stack = [];
  const start = cells[0][0];

  start.visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    const available = shuffle(directions).filter(direction => {
      const nx = current.x + direction.dx;
      const ny = current.y + direction.dy;

      return (
        nx >= 0 &&
        nx < SIZE &&
        ny >= 0 &&
        ny < SIZE &&
        !cells[ny][nx].visited
      );
    });

    if (available.length === 0) {
      stack.pop();
      continue;
    }

    const direction = available[0];

    const nx = current.x + direction.dx;
    const ny = current.y + direction.dy;

    const next = cells[ny][nx];

    // Прибираємо спільні стіни

    current.walls[direction.name] = false;
    next.walls[direction.opposite] = false;

    next.visited = true;

    stack.push(next);
  }
}

// Малювання лабіринту

function drawMaze() {
  mazeElement.innerHTML = '';

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = cells[y][x];

      const element = document.createElement('div');

      element.classList.add('cell');

      if (cell.walls.top) {
        element.classList.add('wall-top');
      }

      if (cell.walls.right) {
        element.classList.add('wall-right');
      }

      if (cell.walls.bottom) {
        element.classList.add('wall-bottom');
      }

      if (cell.walls.left) {
        element.classList.add('wall-left');
      }

      if (x === player.x && y === player.y) {
        element.classList.add('player');
      }

      if (x === SIZE - 1 && y === SIZE - 1) {
        element.classList.add('exit');
      }

      mazeElement.appendChild(element);
    }
  }
}

// Оновлення гри

function updateGame() {
  stepsElement.textContent = steps;
  drawMaze();
}

// Рух гравця

function movePlayer(dx, dy) {
  if (gameFinished) return;

  const newX = player.x + dx;
  const newY = player.y + dy;

  // Перевірка меж лабіринту

  if (
    newX < 0 ||
    newX >= SIZE ||
    newY < 0 ||
    newY >= SIZE
  ) {
    return;
  }

  const currentCell = cells[player.y][player.x];

  let wall;

  if (dx === 1) wall = 'right';
  if (dx === -1) wall = 'left';
  if (dy === 1) wall = 'bottom';
  if (dy === -1) wall = 'top';

  // Якщо є стіна — не рухаємося

  if (currentCell.walls[wall]) {
    return;
  }

  player.x = newX;
  player.y = newY;

  steps++;

  // Перевірка виходу

  if (
    player.x === SIZE - 1 &&
    player.y === SIZE - 1
  ) {
    gameFinished = true;

    messageElement.textContent =
      `🎉 ПЕРЕМОГА! Ти пройшов лабіринт за ${steps} кроків!`;

    messageElement.classList.add('win');
  }

  updateGame();
}

// Керування клавіатурою

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  const controls = {
    arrowup: [0, -1],
    w: [0, -1],

    arrowdown: [0, 1],
    s: [0, 1],

    arrowleft: [-1, 0],
    a: [-1, 0],

    arrowright: [1, 0],
    d: [1, 0]
  };

  if (controls[key]) {
    event.preventDefault();

    const [dx, dy] = controls[key];

    movePlayer(dx, dy);
  }
});

// Нова гра

function newGame() {
  player = { x: 0, y: 0 };
  steps = 0;
  gameFinished = false;

  messageElement.textContent =
    'Знайди вихід із лабіринту!';

  messageElement.classList.remove('win');

  generateMaze();
  updateGame();
}

// Кнопка нового лабіринту

newMazeButton.addEventListener('click', newGame);

// Запуск гри

newGame();