const up = document.querySelector('.btn__up');
const down = document.querySelector('.btn__down');
const right = document.querySelector('.btn__right');
const left = document.querySelector('.btn__left');
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
let height = 520;
const cellHorizontal = 20;
const cellVertical = 15;
const lineThickness = 5;
const wallWidth = 2;
const width = document
  .querySelector('.container')
  .getBoundingClientRect().width;
console.log(width);
if (width > 700) {
  height = 510;
  document.querySelector('.button').style.display = 'none';
}
const unitLengthX = width / cellHorizontal;
const unitLengthY = height / cellVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.querySelector('.container'),
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
    background: 'Black',
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);
//walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, wallWidth, {
    isStatic: true,
    render: {
      fillStyle: 'Blue',
    },
  }),
  Bodies.rectangle(width / 2, height, width, wallWidth, {
    isStatic: true,
    render: {
      fillStyle: 'Blue',
    },
  }),
  Bodies.rectangle(0, height / 2, wallWidth, height, {
    isStatic: true,
    render: {
      fillStyle: 'Blue',
    },
  }),
  Bodies.rectangle(width, height / 2, wallWidth, height, {
    isStatic: true,
    render: {
      fillStyle: 'Blue',
    },
  }),
];
World.add(world, walls);

///Generation of maze

const suffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellVertical)
  .fill(null)
  .map(() => Array(cellHorizontal).fill(false));

const verticals = Array(cellVertical)
  .fill(null)
  .map(() => Array(cellHorizontal - 1).fill(false));

const horizontals = Array(cellVertical - 1)
  .fill(null)
  .map(() => Array(cellHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellVertical);
const startColumn = Math.floor(Math.random() * cellHorizontal);

const stepCell = (r, c) => {
  if (grid[r][c]) {
    return;
  }
  grid[r][c] = true;
  //list of the neighbors .........
  const neighbors = suffle([
    [r - 1, c, 'up'],
    [r, c + 1, 'right'],
    [r + 1, c, 'down'],
    [r, c - 1, 'left'],
  ]);

  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    if (
      nextRow < 0 ||
      nextRow >= cellVertical ||
      nextColumn < 0 ||
      nextColumn >= cellHorizontal
    ) {
      continue;
    }
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    if (direction === 'left') {
      verticals[r][c - 1] = true;
    } else if (direction === 'right') {
      verticals[r][c] = true;
    } else if (direction === 'up') {
      horizontals[r - 1][c] = true;
    } else if (direction === 'down') {
      horizontals[r][c] = true;
    }

    stepCell(nextRow, nextColumn);
  }
};

stepCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open === true) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      lineThickness,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'blue',
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      lineThickness,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'blue',
        },
      }
    );
    World.add(world, wall);
  });
});

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.5,
  unitLengthY * 0.5,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'darkorange',
    },
  }
);
World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;

const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
  render: {
    fillStyle: 'red',
  },
});

World.add(world, ball);

document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity;
  if (event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 2, y });
  }
  if (event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 2 });
  }
  if (event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 2, y });
  }
  if (event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: +2 });
  }
});
[up, down, left, right].forEach((el) =>
  el.addEventListener('click', function (e) {
    const { x, y } = ball.velocity;
    if (this.dataset.value === '1') {
      Body.setVelocity(ball, { x, y: y - 2 });
    }
    if (this.dataset.value === '2') {
      Body.setVelocity(ball, { x, y: +2 });
    }
    if (this.dataset.value === '3') {
      Body.setVelocity(ball, { x: x + 2, y });
    }
    if (this.dataset.value === '4') {
      Body.setVelocity(ball, { x: x - 2, y });
    }
    return;
  })
);
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector('.screen').classList.remove('hidden');
      window.location.hash = atob('cD1Sb2NrZXJXUkM=');
      console.log(atob('Y291cG9uIGNvZGU6LSAkZmxhZyhQQVMtODEpZmxhZyQ='));
      console.log(atob('aHR0cHM6Ly9maW5hbC1saW5rLTEwMTAubmV0bGlmeS5hcHA='));
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
