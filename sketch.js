class Food {
  constructor(x1, y1) {
    this.poi = createVector(0, 0);
    this.pos = createVector(x1, y1);
  }

  // Displays food on canvas
  show() {
    rect(this.pos.x, this.pos.y, 10, 10);
  }

  // Determines if particle sees food or wall
  seeWall(particle, wall) { //(b-b/m-m)
    this.m = (particle.pos.y - this.pos.y) / (particle.pos.x - this.pos.x);
    this.b = this.pos.y - (this.m * this.pos.x);
    this.poi.x = (wall.intercept - this.b) / (this.m - wall.slope);
    this.poi.y = (this.m * this.poi.x) + this.b;

    if ((wall.a.x < this.poi.x && wall.b.x > this.poi.x || wall.b.x < this.poi.x && wall.a.x > this.poi.x)) {
        if(wall.a.y < this.poi.y && wall.b.y > this.poi.y || wall.b.y < this.poi.y && wall.a.y > this.poi.y) {
          if(particle.pos.y < this.poi.y && this.pos.y > this.poi.y || this.pos.y < this.poi.y && particle.pos.y > this.poi.y) {
            if(particle.pos.x < this.poi.x && this.pos.x > this.poi.x || this.pos.x < this.poi.x && particle.pos.x > this.poi.x){
              return true;
            }
          }
        }
      return false;
      }
    }
  }

class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    if ((x1 - x2) != 0) {
      this.slope = (y2 - y1) / (x2 - x1);
    } else {
      this.slope = 0;
    }
    this.intercept = y2 - (this.slope * x2);
  }

  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show(g,b) {
    stroke(255,g,b);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.vel = createVector(0, 0);
    this.radius = 4;
    this.rays = [];
    for (let a = 0; a < 360; a += 1) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  // Moves particle towards mouse or food
  update(x, y) {
    let dir = createVector().set(x - this.pos.x, y - this.pos.y);
    this.vel.set(dir);
    this.vel.limit(2);
    this.pos.add(this.vel);
  }

  // Determines if particle is touching a boundary
  touch(wall) {
    let radius = this.radius;
    let touching = false;
    let equation = Math.abs(this.pos.y - (wall.slope * this.pos.x + wall.intercept));

    if (equation < radius) {
      let domainCheck = false;

      // Checks domain of boundary
      if ((wall.a.x > wall.b.x) && (wall.a.x + radius > this.pos.x && this.pos.x > wall.b.x - radius)) {
        domainCheck = true;
      } else if (wall.b.x + radius > this.pos.x && this.pos.x > wall.a.x - radius) {
        domainCheck = true;
      }

      // Checks range of boundary
      if (domainCheck) {
        if ((wall.a.y > wall.b.y) && (wall.a.y + radius > this.pos.y && this.pos.x > wall.b.y - radius)) {
          touching = true;
        } else if (wall.b.y + radius > this.pos.y && this.pos.y > wall.a.y - radius) {
          touching = true;
        }
      }
    }

    return (touching ? true : false);
  }

  // Increases particle size if touching boundary
  resize(wall) {
    if (this.touch(wall)) {
      this.radius += 0.2;
    }
    if (this.radius > 100) {
      this.radius = 4;
    }
  }

  // Displays particle on canvas
  show(g,b) {
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.radius);
    for (let ray of this.rays) {
      ray.show(g,b);
    }
  }

  // Draws rays from particle to boundaries
  look(walls,g,b) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        // colorMode(HSB);
        // stroke((i + frameCount * 2) % 360, 255, 255, 50);
        stroke(255,g,b);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }
}

// Declaring variables
let walls = [], particle = [], food, xoff = 0, yoff = 10000;

// Setting up program and instances
function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 5; i++) {
    let x1 = random(width);
    let x2 = random(width);
    let y1 = random(height);
    let y2 = random(height);
    walls[i] = new Boundary(x1, y1, x2, y2);
  }

  let g = 255;
  let b = 255;

  walls.push(new Boundary(0, 0, width, 0));
  walls.push(new Boundary(width, 0, width, height));
  walls.push(new Boundary(width, height, 0, height));
  walls.push(new Boundary(0, height, 0, 0));
  particle = new Particle();
  food = new Food(random(width), random(height));
}

// Continuously animates code
function draw() {
  background(0);

  for (let wall of walls) {
    wall.show();
  }

  let seeFood = 0;

  for (let i = 0; i < walls.length - 4; i++) {
    if (!food.seeWall(particle, walls[i])) {
      seeFood++;
    } else {
      i += walls.length;
    }
  }


  if (food.pos.x === particle.pos.x && food.pos.y === particle.pos.y) {
    food.pos.x = random(width);
    food.pos.y = random(height);
  }

  if (seeFood === (walls.length - 4)) {
    particle.update(food.pos.x, food.pos.y);
    g = 0;
    b = 0;
  } else {
    particle.update(mouseX, mouseY);
    g = 255;
    b = 255;
  }

  particle.show(g,b);
  particle.look(walls,g,b);

  food.show();


  xoff += 0.01;
  yoff += 0.01;
}