const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const lineThickness = 3;
const wallWidth = 10;

const width = 1100;
const height = 600;
const cellHorizontal = 40;
const cellVertical = 25;

const unitLengthX = width / cellHorizontal;
const unitLengthY = height / cellVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
    background: "Black",
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);
//walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, wallWidth, {
    isStatic: true,
    render: {
      fillStyle: "Blue",
    },
  }),
  Bodies.rectangle(width / 2, height, width, wallWidth, {
    isStatic: true,
    render: {
      fillStyle: "Blue",
    },
  }),
  Bodies.rectangle(0, height / 2, wallWidth, height, {
    isStatic: true,
    render: {
      fillStyle: "Blue",
    },
  }),
  Bodies.rectangle(width, height / 2, wallWidth, height, {
    isStatic: true,
    render: {
      fillStyle: "Blue",
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
    [r - 1, c, "up"],
    [r, c + 1, "right"],
    [r + 1, c, "down"],
    [r, c - 1, "left"],
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

    if (direction === "left") {
      verticals[r][c - 1] = true;
    } else if (direction === "right") {
      verticals[r][c] = true;
    } else if (direction === "up") {
      horizontals[r - 1][c] = true;
    } else if (direction === "down") {
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
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "blue",
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
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "blue",
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
    label: "goal",
    isStatic: true,
    render: {
      fillStyle: "darkorange",
    },
  }
);
World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "red",
  },
});

World.add(world, ball);

document.addEventListener("keydown", (event) => {
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

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".screen").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});

const screen = document.querySelector(".screen");
const restart = document.querySelector(".restart");
const easy = document.querySelector(".easy");
const medium = document.querySelector(".medium");
const hard = document.querySelector(".hard");

const el = [screen, restart, easy, medium, hard];
document.addEventListener("click", (event) => {
  if (event.target === el[0]) {
    reset();
  } else if (event.target === el[1]) {
  } else if (event.target === el[2]) {
    World.remove(world, Bodies);
  } else if (event.target === el[3]) {
  } else if (event.target === el[4]) {
  }
  //handle click
});
