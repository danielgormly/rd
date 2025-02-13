// Implementation of a point quadtree
// Regions is divided recursively into 4 equal areas, until we reach arbitrarily defined capacity
// Abandoned after reaching enough understanding

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
  }
}

class Quadtree extends Rectangle {
  capacity = 4;
  points: Point[] = [];
  divisions?: [Quadtree, Quadtree, Quadtree, Quadtree];
  constructor(
    boundary: [x: number, y: number, width: number, height: number],
    capacity = 4,
  ) {
    super(...boundary);
    this.capacity = capacity;
  }
  insert(point: Point) {
    if (!this.contains(point)) return;
    if (this.points.length < this.capacity) {
      this.points.push(point);
      return;
    }
    if (!this.divisions) {
      this.subdivide();
    }
    this.divisions?.forEach((dq) => {
      dq.insert(point);
    });
  }
  contains(point: Point) {
    return (
      point.x > this.x &&
      point.x < this.x + this.w &&
      point.y > this.y &&
      point.y < this.y + this.h
    );
  }
  subdivide() {
    const nw = new Quadtree([this.x, this.y, this.w / 2, this.h / 2]);
    const ne = new Quadtree([
      this.x + this.w / 2,
      this.y,
      this.w / 2,
      this.h / 2,
    ]);
    const sw = new Quadtree([
      this.x + this.h / 2,
      this.y + this.h / 2,
      this.w / 2,
      this.h / 2,
    ]);
    const se = new Quadtree([
      this.x,
      this.y + this.h / 2,
      this.w / 2,
      this.h / 2,
    ]);
    this.divisions = [nw, ne, sw, se];
  }
}

function main() {
  const qt = new Quadtree([0, 0, 200, 200]);
  for (let i = 0; i < 50; i++) {
    const point = new Point(Math.random() * 400, Math.random() * 400);
    qt.insert(point);
  }
  console.log(qt);
}

main();
