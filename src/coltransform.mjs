import fs from 'fs';
let obj = JSON.parse(fs.readFileSync('./src/col.json').toString());
let output = Object.entries(obj).map(([key, val]) => {
  let r = Math.round(val['Red Component'] * 255);
  let g = Math.round(val['Green Component'] * 255);
  let b = Math.round(val['Blue Component'] * 255);
  return `let ${key.replace(/\s/g, '')} = '#${[r.toString(16), g.toString(16), b.toString(16)].join(
    ''
  )};'`;
});
console.log(output.join('\n'));
fs.writeFileSync('./src/col.ts', output.join('\n'));
