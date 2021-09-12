import {
  bezierSpline,
  catmulToBezier,
  drawBezierLoop,
  drawLine,
  flr,
  rndm,
  spline,
  Vec,
  Vp,
} from '@rupertofly/h';
import { range } from 'd3-array';
import { hcl } from 'd3-color';
import * as col from './col';
import { DifferentialLine, Node } from './diffGrowth';
import capturer from '@rupertofly/capture-client';
import { path } from 'd3';
import { Path } from 'd3-path';
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const cap = new capturer(2469, canvas);
canvas.width = 1080;
canvas.height = 1920;
const [W, H] = [canvas.width, canvas.height];
const ctx = canvas.getContext('2d')!;
ctx.fillStyle = col.darkGrey;
ctx.fillRect(0, 0, W, H);
const pts = range(30).map((i) => {
  let theta = (i / 30) * (Math.PI * 2);
  return new Vec([W / 2 + Math.cos(theta) * 40, H / 2 + Math.sin(theta) * 40]);
});
const line = new DifferentialLine();
pts.forEach((pt) => {
  line.add(new Node(pt.x, pt.y));
});
const cl = hcl(col.green);
cap.start({
  frameRate: 60,
  lengthIsFrames: true,
  maxLength: 600,
  name: 'diff',
});
function customLoop(loop: [number, number][], close, ctx: CanvasRenderingContext2D) {
  for (let i = 0; i <= loop.length - 3; i += 4) {
    ctx.beginPath();
    if (i === 0) ctx.moveTo(...loop[0]);
    else ctx.lineTo(...loop[i]);
    ctx.strokeStyle = hcl((i / loop.length) * 360, cl.c, cl.l).toString();
    ctx.bezierCurveTo(
      loop[i + 1][0],
      loop[i + 1][1],
      loop[i + 2][0],
      loop[i + 2][1],
      loop[i + 3][0],
      loop[i + 3][1]
    );
    ctx.stroke();
  }
  if (close) ctx.closePath();
}
async function render() {
  ctx.fillStyle = col.darkGrey;
  ctx.fillRect(0, 0, W, H);
  line.run();
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = col.green;
  ctx.fillStyle = col.green;
  // const lp = [...spline(line.positions(), 3, false, flr(line.length * 3))];
  ctx.beginPath();
  customLoop(bezierSpline(line.positions(), 3, true) as any, false, ctx);
  await cap.capture();
  requestAnimationFrame(render);
}
render();
