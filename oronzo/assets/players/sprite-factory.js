/** R02: targeted facial, kit seam, socks and boot readability refinement. Original 8x4 indexed atlas contract preserved. */
function buildOronzoPlayers(){
 const W=256,H=128,D=['N','NE','E','SE','S','SW','W','NW'],dirs=[[0,-1],[.71,-.71],[1,0],[.71,.71],[0,1],[-.71,.71],[-1,0],[-.71,-.71]];
 const mat=['skin','hair','shirt','shorts','socks','boots','outline','gloves','shadow'];
 const hex=[
 ['#ffdba4','#eeb87f','#c88453','#8f5336'],['#b17846','#784625','#50291d','#261917'],
 ['#fa7061','#cf353a','#972d3a','#582632'],['#f6f4e4','#d8d5c1','#9c9c91','#646675'],
 ['#fff4df','#ddd9d4','#a4adb9','#6d7789'],['#4a4a60','#313344','#202437','#101828'],
 ['#372c3f','#302438','#231d30','#171726'],['#f8e6be','#d9cec2','#b6aca3','#746d77'],
 ['#101522','#101522','#101522','#101522']];
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),pBase=[[0,0,0]],pMask=[[0,0,0]],alpha=[0];
 for(let m=0;m<mat.length;m++)for(let s=0;s<4;s++){pBase.push(rgb(hex[m][s]));pMask.push([24*(m+1),64*s,0]);alpha.push(m===8?55:255)}
 function pix(c,x,y,m,s=1){x=Math.round(x);y=Math.round(y);if(x>=0&&x<32&&y>=0&&y<32)c[y*32+x]=m>=0?1+m*4+Math.max(0,Math.min(3,s)):0}
 function oval(c,cx,cy,rx,ry,m,s=1){for(let y=Math.max(0,Math.floor(cy-ry-1));y<Math.min(32,Math.ceil(cy+ry+1));y++)for(let x=Math.max(0,Math.floor(cx-rx-1));x<Math.min(32,Math.ceil(cx+rx+1));x++)if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1)pix(c,x,y,m,s)}
 function poly(c,P,m,s=1){const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);for(let y=Math.max(0,Math.floor(Math.min(...ys)));y<Math.min(32,Math.ceil(Math.max(...ys)));y++)for(let x=Math.max(0,Math.floor(Math.min(...xs)));x<Math.min(32,Math.ceil(Math.max(...xs)));x++){let hit=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&(x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0]))hit=!hit}if(hit)pix(c,x,y,m,s)}}
 function seg(c,a,b,w,m,s=1){let dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ox=-dy/L*w/2,oy=dx/L*w/2;poly(c,[[a[0]+ox,a[1]+oy],[b[0]+ox,b[1]+oy],[b[0]-ox,b[1]-oy],[a[0]-ox,a[1]-oy]],m,s);oval(c,a[0],a[1],w/2,w/2,m,s);oval(c,b[0],b[1],w/2,w/2,m,s)}
 function limb(c,a,b,w,m,s=1){seg(c,a,b,w+1.5,6,2);seg(c,a,b,w,m,s);if(w>2.8)seg(c,[a[0]-.4,a[1]-.4],[b[0]-.4,b[1]-.4],1,m,0)}
 function torso(c,x,y,prof,back,gk){let l=x-4.9*prof,r=x+4.9*prof;poly(c,[[l-1,y],[r+1,y],[r+.2,y+9],[l+.2,y+9]],6,2);poly(c,[[l,y+.6],[r,y+.6],[r-.8,y+8],[l+.8,y+8]],2,2);poly(c,[[l+.2,y+1],[l+2.1,y+.6],[l+1.5,y+7.5],[l+.7,y+7]],2,0);poly(c,[[r-2.1,y+1],[r-.3,y+1],[r-1,y+7],[r-2.5,y+8]],2,3);seg(c,[l+1,y+8],[r-1,y+8],1,2,3);seg(c,[x-1.7,y+.8],[x+1.7,y+.8],1,2,0);pix(c,l+1,y+2,2,3);pix(c,r-1,y+2,2,0); /* shirt seams, collar and folds remain in shirt material */ seg(c,[x-1.2,y+1.5],[x+.4,y+3.3],.75,2,0);pix(c,l+2,y+6.5,2,1);pix(c,r-2,y+6.5,2,3);pix(c,x-1,y+7,2,1);if(gk){seg(c,[l+1,y+4],[r-1,y+4],1,2,1);pix(c,r-2,y+7,2,0)}if(back)seg(c,[x-2.2,y+3],[x+2.2,y+3],1,2,1)}
 function head(c,x,y,dx,back){oval(c,x,y,4,4.7,6,2);oval(c,x,y+.1,3.2,3.8,0,2);oval(c,x-1,y-1.2,2.5,2.6,0,0);oval(c,x+2,y+.4,1.25,2.6,0,3);oval(c,x-.2,y-2.25,3.7,2.6,1,2);seg(c,[x-3,y-2.1],[x+2.7,y-2.4],1,1,0);if(back){oval(c,x,y-.6,3.1,3,1,2);seg(c,[x-2,y+1],[x+2,y+1],1,1,3)}else{if(Math.abs(dx)<.5){pix(c,x-1,y+.8,6,2);pix(c,x+1.6,y+.8,6,2);pix(c,x,y+2.4,0,3)}else{pix(c,x+dx*2.2,y+.4,6,2);pix(c,x+dx*3,y+1.3,0,0);pix(c,x+dx,y+2.4,0,3)}}pix(c,x-2,y-3,1,0);/* highlight in hairline */pix(c,x+1,y-3.6,1,0);/* ears and nose silhouette */if(Math.abs(dx)>.5&&!back)pix(c,x+dx*3.2,y+1,0,1)}
 function foot(c,x,y,dx,dy){x=Math.max(2,Math.min(29,x+dx*.9));y=Math.max(2,Math.min(28.1,y));seg(c,[x-1.4,y],[x+1.4+dx,y+dy*.55],2.9,6,2);seg(c,[x-1.2,y-.3],[x+1+dx,y-.5+dy*.55],2,5,1);pix(c,x-1.1,y-.9,5,0);pix(c,x+dx,y-.4,5,0)}
 function draw(anim,di,fi){
  const c=new Uint8Array(1024),[dx,dy]=dirs[di],back=di<=1||di>=7,prof=1-.32*Math.abs(dx),wave=[0,1,0,-1][fi],run=anim==='run',kick=anim==='kick',tackle=anim==='tackle',gk=anim==='keeper';
  const bob=run?[0,-.7,0,-1.1][fi]:gk?[0,-1,-2,-1][fi]:[0,0,-.25,.25][fi];
  const bx=16+dx*1.1;let hx=bx+dx*2.15,sy=12+bob,hy=20+bob,tx=bx,lean=0;
  if(kick&&fi>0)hx+=dx*1.25;
  if(tackle&&fi>0){lean=[0,2,4,3][fi]*(dx||1);sy+=[0,2,4,3][fi];hy+=1.6;hx+=lean;tx+=lean*.6}
  if(gk&&fi>1){lean=[0,0,4,6][fi]*(dx||1);hx+=lean;sy+=fi===2?2:5;hy+=2.2;tx+=lean*.5}
  oval(c,16,28.5,7.5,1.9,8,2);
  const sep=2.55*prof,feet=[[bx-sep,27.1+bob*.35],[bx+sep,27.1+bob*.35]];
  if(run){feet[0]=[bx-sep+dx*wave*3.1-wave*1.8,26.5-2.1*wave+bob*.25];feet[1]=[bx+sep-dx*wave*3.1+wave*1.8,26.5+2.1*wave+bob*.25]}
  if(kick&&fi>0)feet[1]=[bx+sep+dx*[0,2.5,6.5,3.8][fi]+2.4,26-[0,3,7,4][fi]+dy*1.4];
  if(tackle&&fi>0){feet[0]=[bx-4.8-(dx||1)*(fi===1?0:3.4),26.5];feet[1]=[bx+3.6+(dx||1)*3.2,25.2]}
  if(gk){feet[0][0]-=1.3;feet[1][0]+=1.3;if(fi>1){feet[0][0]-=3;feet[1][0]-=1.5;feet[0][1]-=2;feet[1][1]-=3}}
  for(let k=0;k<2;k++){const sign=k===0?-1:1,hip=[bx+sign*sep*.7,hy],kn=[(hip[0]+feet[k][0])*.5-sign*.35,22.7+bob*.6+(run?sign*wave*.7:0)],ank=[feet[k][0],feet[k][1]-1.5];limb(c,hip,kn,4.6,3,k===0?2:1);limb(c,kn,ank,3.4,4,k===0?2:1);seg(c,[kn[0]-.9,kn[1]+1.3],[ank[0],ank[1]-.6],.9,4,0);/* sock top band, 1px */pix(c,kn[0],kn[1]+2,4,3);foot(c,feet[k][0],feet[k][1],dx,dy)}
  const arms=[[[bx-4.1*prof,sy+1.5],[bx-6.2*prof,sy+5],[bx-5.2*prof,sy+8]],[[bx+4.1*prof,sy+1.5],[bx+6.2*prof,sy+5],[bx+5.2*prof,sy+8]]];
  if(run)for(let k=0;k<2;k++){let sign=k===0?-1:1;arms[k][1][0]+=sign*wave*1.1;arms[k][2][1]+=sign*wave*2;arms[k][2][0]-=dx*wave*2}
  if(!run&&!kick&&!tackle&&!gk&&fi===1){arms[0][2][1]-=2;arms[1][2][0]+=1.5}
  if(run&&fi===2){arms[0][2][0]-=2;arms[1][2][1]+=1.5}
  if(kick){arms[0][2][0]-=fi*1.1;arms[1][2][0]+=fi;arms[0][2][1]-=fi*.55}
  if(tackle&&fi>0){arms[0][2]=[bx-7+lean*.7,sy+3];arms[1][2]=[bx+7+lean*.7,sy+4]}
  if(gk){let gy=[7,-1,-5,0][fi];arms[0][2]=[bx-8+lean*.35,sy+gy];arms[1][2]=[bx+8+lean*.35,sy+gy];for(let k=0;k<2;k++)arms[k][1][1]=sy+gy*.55}
  function arm(k){const [a,b,d]=arms[k];limb(c,a,b,3.6,2,k===0?1:2);limb(c,b,d,2.7,0,k===0?1:2);if(gk){oval(c,d[0],d[1],2.7,2.4,6,2);oval(c,d[0],d[1],2.1,1.8,7,1);pix(c,d[0]-1,d[1]-1,7,0)}else{oval(c,d[0],d[1],1.65,1.75,0,1);pix(c,d[0]-.8,d[1]-1,0,0)}}
  arm(0);torso(c,tx,sy,prof,back,gk);arm(1);seg(c,[hx,sy+.6],[hx,sy-2],2.7,0,1);head(c,hx,sy-5.7,dx,back);return c;
 }
 function crc(a){let n=-1;for(const b of a){n^=b;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0)}return(n^(-1))>>>0}
 const be=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255],join=(...a)=>a.flat();
 function png(id,pal,al,w=256,h=128){
  const chunk=(name,data)=>{const n=name.split('').map(c=>c.charCodeAt(0));return join(be(data.length),n,data,be(crc(join(n,data))))},raw=[];
  for(let y=0;y<h;y++){raw.push(0);for(let x=0;x<w;x++)raw.push(id[y*w+x])}
  let zip=[0x78,0x01],a=1,b=0;
  for(let off=0;off<raw.length;){let n=Math.min(65535,raw.length-off);zip.push(off+n>=raw.length?1:0,n&255,(n>>>8)&255,(~n)&255,((~n)>>>8)&255);for(let i=off;i<off+n;i++){let v=raw[i];zip.push(v);a=(a+v)%65521;b=(b+a)%65521}off+=n}
  zip.push(...be(((b<<16)|a)>>>0));return new Uint8Array(join([137,80,78,71,13,10,26,10],chunk('IHDR',join(be(w),be(h),[8,3,0,0,0])),chunk('PLTE',pal.flat()),chunk('tRNS',al),chunk('IDAT',zip),chunk('IEND',[])));
 }
 const out={},metrics={};
 for(const anim of ['idle','run','kick','tackle','keeper']){
  const atlas=new Uint8Array(W*H),measure=[];
  for(let f=0;f<4;f++)for(let d=0;d<8;d++){
   const frame=draw(anim,d,f);let count=0,bbox=[32,32,0,0];
   for(let y=0;y<32;y++)for(let x=0;x<32;x++){const p=frame[y*32+x];atlas[(f*32+y)*W+d*32+x]=p;if(p){count++;if(p<33){bbox[0]=Math.min(bbox[0],x);bbox[1]=Math.min(bbox[1],y);bbox[2]=Math.max(bbox[2],x);bbox[3]=Math.max(bbox[3],y)}}}
   measure.push({direction:D[d],frame:f,pixels:count,bbox})
  }
  metrics[anim]=measure;out[`${anim}.png`]=png(atlas,pBase,alpha);out[`${anim}-mask.png`]=png(atlas,pMask,alpha);
 }
 const ball=new Uint8Array(256);for(let y=2;y<14;y++)for(let x=2;x<14;x++){let r=Math.hypot(x-7.5,y-7.5);if(r<5.7)ball[y*16+x]=r>4.8?25:y<6?13:14}
 for(const [x,y] of [[7,5],[5,9],[10,10],[11,6]])for(const [ox,oy] of [[0,-1],[1,0],[1,1],[0,2],[-1,1],[-1,0]]){let px=x+ox,py=y+oy;if(px>=0&&py>=0&&px<16&&py<16)ball[py*16+px]=25}
 out['ball.png']=png(ball,pBase,alpha,16,16);
 return {out,metrics,materials:mat,maskColors:pMask,baseColors:pBase};
}
if(typeof module!=='undefined')module.exports=buildOronzoPlayers;
