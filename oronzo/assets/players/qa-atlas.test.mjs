import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const factory=require('./sprite-factory.js');
const looks=require('./team-looks.js');
const built=factory();
const manifest=JSON.parse(readFileSync(join(here,'manifest.json'),'utf8'));
const ACTIONS=['idle','run','kick','tackle','keeper'];
const DIRS=['N','NE','E','SE','S','SW','W','NW'];
const WIDTH=256,HEIGHT=128;

function parsePNG(buf){
  assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
  let p=8,ihdr=null,palette=null,alpha=null,parts=[];
  while(p<buf.length){
    const n=buf.readUInt32BE(p),tag=buf.toString('ascii',p+4,p+8),data=buf.subarray(p+8,p+8+n);
    if(tag==='IHDR')ihdr=data;
    if(tag==='PLTE')palette=data;
    if(tag==='tRNS')alpha=data;
    if(tag==='IDAT')parts.push(data);
    p+=12+n;if(tag==='IEND')break;
  }
  const w=ihdr.readUInt32BE(0),h=ihdr.readUInt32BE(4);
  assert.equal(ihdr[8],8,'index depth 8');
  assert.equal(ihdr[9],3,'indexed colors');
  assert.equal(alpha[0],0,'transparent palette index zero');
  const scan=inflateSync(Buffer.concat(parts));
  assert.equal(scan.length,(w+1)*h,'scanline dimensions');
  const pixels=Buffer.alloc(w*h);
  for(let y=0;y<h;y++){
    assert.equal(scan[y*(w+1)],0,'PNG scanline filter None');
    scan.copy(pixels,y*w,y*(w+1)+1,(y+1)*(w+1));
  }
  return {w,h,pixels,palette,alpha};
}
function frameHash(pixels,di,fi){
  let hash=2166136261;
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    hash=Math.imul(hash^pixels[(fi*32+y)*256+di*32+x],16777619);
  }
  return hash>>>0;
}
test('5 indexed atlas + 5 aligned material masks + ball, byte reproducible',()=>{
  for(const action of ACTIONS){
    const a=join(here,action+'.png'),m=join(here,action+'-mask.png');
    const r=readFileSync(a),mr=readFileSync(m);
    assert.deepEqual(r,Buffer.from(built.out[action+'.png']));
    assert.deepEqual(mr,Buffer.from(built.out[action+'-mask.png']));
    const source=parsePNG(r),mask=parsePNG(mr);
    assert.equal(source.w,WIDTH);assert.equal(source.h,HEIGHT);
    assert.equal(mask.w,WIDTH);assert.equal(mask.h,HEIGHT);
    assert.deepEqual(source.pixels,mask.pixels,'mask uses same indices, different palette RGB');
  }
  const ball=parsePNG(readFileSync(join(here,'ball.png')));
  assert.equal(ball.w,16);assert.equal(ball.h,16);
});
test('160 playable cells 32x32 pivot(16,29), with unique pose in each frame',()=>{
  assert.equal(manifest.atlas.width,WIDTH);assert.equal(manifest.atlas.height,HEIGHT);
  assert.deepEqual(manifest.atlas.directionOrder,DIRS);
  for(const act of ACTIONS){
    const p=parsePNG(readFileSync(join(here,act+'.png'))).pixels;
    for(let d=0;d<8;d++){
      const frames=manifest.actions[act].directions[DIRS[d]];
      assert.equal(frames.length,4);
      assert.equal(new Set(Array.from({length:4},(_,fi)=>frameHash(p,d,fi))).size,4,
        act+' '+DIRS[d]+' duplicate pose');
      for(let fi=0;fi<4;fi++){
        assert.deepEqual([frames[fi].x,frames[fi].y,frames[fi].w,frames[fi].h,
          frames[fi].pivotX,frames[fi].pivotY],
          [d*32,fi*32,32,32,16,29]);
      }
    }
  }
});
test('22 different material-based looks; one clear home and away kit + two keeper kits',()=>{
  const roster=looks.roster();
  assert.equal(roster.length,22);
  assert.equal(new Set(roster.map(p=>p.id)).size,22);
  assert.equal(roster.filter(p=>p.team==='home').length,11);
  assert.equal(roster.filter(p=>p.team==='away').length,11);
  assert.equal(roster.filter(p=>p.keeper).length,2);
  for(const p of roster){
    const a=looks.appearance(p.team,p.index,p.keeper);
    assert.deepEqual(a,p.appearance);
    assert.match(a.skin,/^#[0-9A-Fa-f]{6}$/);
    assert.match(a.hair,/^#[0-9A-Fa-f]{6}$/);
    assert.ok(['solid','vertical','horizontal','halves'].includes(a.pattern));
  }
  const values=roster.map(x=>x.appearance);
  assert.equal(new Set(values.map(x=>x.skin)).size>=6,true);
  assert.equal(new Set(values.map(x=>x.hair)).size>=6,true);
  assert.notEqual(values[1].shirt,values[12].shirt);
  assert.notEqual(values[0].shirt,values[11].shirt);
});
test('all 9 masks map to valid shade levels and material IDs',()=>{
  for(const action of ACTIONS){
    const mask=parsePNG(readFileSync(join(here,action+'-mask.png')));
    for(const ix of mask.pixels){
      if(ix===0)continue;
      const material=Math.floor((ix-1)/4),shade=(ix-1)%4;
      assert.ok(material>=0&&material<=8);
      assert.ok(shade>=0&&shade<=3);
      const index=ix*3;
      assert.equal(mask.palette[index],24*(material+1));
      assert.equal(mask.palette[index+1],64*shade);
    }
  }
});

test('R10 crop gate: all 160 opaque silhouettes keep a transparent 1px frame border',()=>{
  for(const action of ACTIONS){
    const p=parsePNG(readFileSync(join(here,action+'.png'))).pixels;
    for(let d=0;d<8;d++)for(let f=0;f<4;f++)
      for(let y=0;y<32;y++)for(let x=0;x<32;x++){
        const index=p[(f*32+y)*256+d*32+x];
        if(index>0&&index<=32){
          assert.ok(x>=1&&x<=30&&y>=1&&y<=30,
            action+' direction '+DIRS[d]+' frame '+f+
            ' silhouette touches atlas cell edge '+x+','+y);
        }
      }
  }
});
