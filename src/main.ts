import {
  bezierSpline,
  catmulToBezier,
  drawBezierLoop,
  drawLine,
  drawLoop,
  flr,
  PI,
  rndm,
  spline,
  TAU,
  Vec,
  Vp,
} from '@rupertofly/h';
import { mean, range } from 'd3-array';
import { hcl, rgb } from 'd3-color';
import * as PB from 'cli-progress';
import * as col from './col';
import { DifferentialLine, Node } from './diffGrowth';
import walkPts from './points';
// import capturer from '@rupertofly/capture-client';
import { path, interpolateLab, scaleLinear } from 'd3';
import { Path } from 'd3-path';
import clip from './clip';
import { writeFileSync } from 'fs';
// const cap = new capturer(2469, canvas);

const [W, H] = [297.64, 419.53];
// const ctx = canvas.getContext('2d')!;
// const
// console.log(walkPts);

const pts = range(30).map((i) => {
  let theta = (i / 30) * (Math.PI * 2);
  return new Vec([W / 2 + Math.cos(theta) * 40, H / 2 + Math.sin(theta) * 40]);
});
const line = new DifferentialLine(clip);
// range(32).forEach((i) => {
//   let t = i / 32;
//   let ang = t * TAU;
//   line.add(new Node(W / 2 + Math.cos(ang) * 50, H / 2 + Math.sin(ang) * 50));
// });
walkPts.forEach((pt) => {
  line.add(new Node(pt[0], pt[1]));
});
range(320).forEach((i) => line.growth());
const cl = hcl(col.green);
// cap.start({
//   frameRate: 60,
//   lengthIsFrames: true,
//   maxLength: 600,
//   name: 'diff',
// });
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
let fc = 0;
let colInt = interpolateLab('#7c02ff', '#cca2ff');
let cool = scaleLinear<string, string, never>()
  .range([col.red, col.orange, col.yellow, col.green, col.cyan, col.purple, '#ff6188'])
  .interpolate(interpolateLab)
  .domain([0 / 7, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 6, 6 / 6, 7 / 6]);
const progBar = new PB.SingleBar({}, PB.Presets.shades_classic);
const ITER_AMT = 500;
console.log('Processing');

progBar.start(ITER_AMT, 0);
range(ITER_AMT).forEach((i) => {
  line.run();
  progBar.increment();
});
progBar.stop();
let outputPoints = line.positions();
console.log('Drawing');
let p = path();
drawBezierLoop(catmulToBezier(outputPoints), true, p);
console.log('drawn');
const SVGHead = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 25.4.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="297.64px" height="419.53px" viewBox="0 0 297.64 419.53" style="enable-background:new 0 0 297.64 419.53;"
	 xml:space="preserve">`;
const svgPath = `<path fill="${col.green}" d="${p.toString()}" />`;
writeFileSync('./output.svg', `${SVGHead}${svgPath}</svg>`);
console.log('Written');

function update() {
  // ctx.beginPath();
  // drawLoop(clip, true, ctx);
  // ctx.stroke();
  line.run();
  let pts = line.positions();

  fc++;
}
