import { rndm, Vec, Vp } from '@rupertofly/h';
function limitPure(vec: Vec, scaler: number): Vec {
  if (vec.magnitude() > scaler) {
    return vec.clone().norm().mulScaler(scaler);
  } else return vec.clone();
}
const MAX_FORCE = 0.3;
const MAX_SPEED = 1.4;
const DESIRED_SEPARATION = 38;
const COHESION_RATIO = 1.4;
const MAX_EDGE_LEN = 13;

export class Node {
  position: Vec;
  velocity: Vec;
  acceleration: Vec;
  constructor(x: number, y: number) {
    this.acceleration = new Vec([0, 0]);
    this.velocity = new Vec([rndm() - 0.5, rndm() - 0.5]).norm();
    this.position = Vec.fromObject({ x, y });
  }
  update() {
    this.velocity.add(this.acceleration);
    if (this.velocity.magnitude() > MAX_FORCE) {
      this.velocity.norm().mulScaler(MAX_FORCE);
    }
    this.position.add(this.velocity);
    this.acceleration.mulScaler(0);
    return this;
  }
  sepparate(nodes: Array<Node>): Vec {
    const steer = new Vec([0, 0]);
    let count = 0;
    for (let other of nodes) {
      let dist = this.position.dist(other.position);
      if (dist > 0 && dist < DESIRED_SEPARATION) {
        let diff = this.position.clone().sub(other.position).norm().divScaler(dist);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.divScaler(count);
    }
    if (steer.len() > 0) {
      steer.norm().mulScaler(MAX_SPEED).sub(this.velocity);
      if (steer.len() > MAX_FORCE) {
        steer.norm().mulScaler(MAX_FORCE);
      }
    }
    return steer;
  }
  seek(target: Vec): Vec {
    let desired = target.clone().sub(this.position);
    if (desired.magnitude() > MAX_SPEED) desired.norm().mulScaler(MAX_SPEED);
    let steer = desired.clone().sub(this.velocity);
    steer = limitPure(steer, MAX_FORCE);
    return steer;
  }
  applyForce(force: Vp) {
    this.acceleration.add(force);
    return this;
  }
  edgeCohesion(nodes: Array<Node>): Vec {
    let sum = new Vec([0, 0]);
    const lastIndex = nodes.length - 1;
    const thisIndex = nodes.indexOf(this);
    if (thisIndex === -1) throw new Error(`Node is not present in set of nodes provided`);
    // begin the weird
    if (thisIndex !== 0 && thisIndex !== lastIndex) {
      sum.add(nodes[thisIndex - 1].position).add(nodes[thisIndex + 1].position);
    } else if (thisIndex === 0) {
      sum.add(nodes[lastIndex].position).add(nodes[thisIndex + 1].position);
    } else if (thisIndex === lastIndex) {
      sum.add(nodes[thisIndex - 1].position).add(nodes[0].position);
    }
    sum.divScaler(2);
    return this.seek(sum);
  }
  differentiate(nodes: Array<Node>) {
    let sepperation = this.sepparate(nodes);
    let cohesion = this.edgeCohesion(nodes);
    sepperation.mulScaler(COHESION_RATIO);
    this.applyForce(sepperation);
    this.applyForce(cohesion);
    return this;
  }
  run(nodes: Array<Node>) {
    return this.differentiate(nodes).update();
  }
}
export class DifferentialLine extends Array<Node> {
  constructor() {
    super();
  }
  run() {
    for (let n of this) {
      n.run(this);
    }
    this.growth();
  }
  add(node: Node) {
    this.push(node);
    return this;
  }
  addAt(node: Node, index: number) {
    this.splice(index, 0, node);
    return this;
  }
  growth() {
    for (let i = 0; i < this.length - 1; i++) {
      let thisNode = this[i];
      let nextNode = this[i + 1];
      let dist = thisNode.position.dist(nextNode.position);
      if (dist > MAX_EDGE_LEN) {
        let index = i + 1;
        let midNode = thisNode.position.clone().add(nextNode.position).divScaler(2);
        this.addAt(new Node(midNode.x, midNode.y), index);
      }
    }
  }
  positions() {
    return this.map((node) => node.position);
  }
}
