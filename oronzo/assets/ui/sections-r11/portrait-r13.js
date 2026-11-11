/** R13 original pixel portrait renderer. Appearance is read-only and seeded by saved visual IDs. */
const SKIN=['#E6B485','#BD8058','#F0C998','#98633F','#D59A70','#B87451','#A87552','#E2AF7A'];
const HAIR=['#292022','#6D422B','#2C252C','#9C6737','#49271D','#C49259','#201D20','#594131'];
const ink='#20202c';
const index=(v,n)=>Number.isInteger(Number(v))?Math.abs(Number(v))%n:0;
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const shade=(hex,delta)=>{const n=parseInt(String(hex).replace('#',''),16);if(!Number.isFinite(n))return '#555555';return '#'+[16,8,0].map(k=>Math.max(0,Math.min(255,((n>>k)&255)+delta)).toString(16).padStart(2,'0')).join('');};
const shirtColor=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:'#315b9c';
/** Draw 56x56 native pixels, scaled exactly 2x to a 112x112 portrait.
 * 4 face shapes x 4 hair shapes x 4 facial hair styles; no external assets or mutable RNG.
 */
export function drawPortrait(canvas,appearance={},kit={}){
 const c=canvas?.getContext?.('2d');if(!c)return false;
 canvas.width=112;canvas.height=112;c.imageSmoothingEnabled=false;
 c.clearRect(0,0,112,112);c.save();c.scale(2,2);
 const skin=SKIN[index(appearance.skinToneId,SKIN.length)];
 const hair=HAIR[index(appearance.hairColorId,HAIR.length)];
 const face=index(appearance.faceVariantId,4);
 const cut=index(appearance.hairStyleId,5);
 const beard=index(appearance.facialHairStyleId,5);
 const eyes=index(appearance.eyeVariantId??appearance.faceVariantId,4);
 const nose=index(appearance.noseVariantId??appearance.faceVariantId,4);
 const brow=index(appearance.browVariantId??appearance.hairStyleId,4);
 const shirt=shirtColor(kit.shirtA||kit.shirt);
 const second=shirtColor(kit.shirtB||kit.trim||shirt);
 // Studio backdrop with stepped retro floodlights and a lower-third gradient.
 rect(c,0,0,56,56,'#122b50');rect(c,2,2,52,52,'#27496c');
 for(let i=0;i<8;i++){rect(c,3+i*7,5,3,2,'#3b6081');rect(c,0,42+i*2,56,1,i%2?'#244b60':'#315b6c');}
 // Torso and shirt: the club palette may change on transfer; the face does not.
 rect(c,8,45,40,11,ink);rect(c,10,43,36,13,shirt);
 rect(c,5,49,10,7,shirt);rect(c,41,49,10,7,shirt);
 rect(c,13,45,4,11,shade(shirt,-25));rect(c,39,45,4,11,shade(shirt,-25));
 const pattern=String(kit.shirtPatternId||kit.pattern||'');
 if(/vertical|stripe|righe/i.test(pattern)){for(let x=20;x<=36;x+=8)rect(c,x,47,3,9,second);}
 else if(/horizontal|fasce/i.test(pattern))rect(c,13,50,30,3,second);
 else if(/half|metà/i.test(pattern))rect(c,28,47,11,9,second);
 else if(/diagonal|banda/i.test(pattern)){for(let y=47;y<56;y++)rect(c,18+(y-47),y,5,1,second);}
 else if(/checker|quadri/i.test(pattern)){for(let y=47;y<56;y+=4)for(let x=17;x<39;x+=8)rect(c,x+((y-47)%8?4:0),y,4,4,second);}
 rect(c,23,44,10,5,shade(skin,-15));rect(c,24,43,8,4,skin);
 // Ears, jaw and cheek shape.
 const width=[22,24,20,24][face],left=28-width/2;
 rect(c,left-3,23,3,10,ink);rect(c,left+width,23,3,10,ink);
 rect(c,left-2,24,3,8,shade(skin,-25));rect(c,left+width-1,24,3,8,shade(skin,-25));
 rect(c,left-1,13,width+2,29,ink);
 rect(c,left,14,width,24,skin);
 rect(c,left+2,37,width-4,4,shade(skin,-18));
 if(face===1){rect(c,left-1,24,2,11,skin);rect(c,left+width-1,24,2,11,skin);}
 if(face===2){rect(c,left+3,40,width-6,2,ink);rect(c,left+4,40,width-8,2,shade(skin,-12));}
 if(face===3){rect(c,left-2,26,3,7,skin);rect(c,left+width-1,26,3,7,skin);}
 // Independent pixel layers for eyebrows, eyes and nose; all derive from persisted DNA.
 const eyeY=eyes===1?28:27;
 const eyeWidth=eyes===2?4:3;
 const browY=brow===1?22:24;
 rect(c,left+4,browY,5,brow===2?1:2,shade(hair,brow===3?24:0));
 rect(c,left+width-9,browY+(brow===3?1:0),5,brow===2?1:2,shade(hair,brow===3?24:0));
 rect(c,left+5,eyeY,eyeWidth,eyes===3?2:3,'#f5e6c9');
 rect(c,left+width-8,eyeY,eyeWidth,eyes===3?2:3,'#f5e6c9');
 rect(c,left+6,eyeY,1,eyes===3?2:3,ink);
 rect(c,left+width-7,eyeY,1,eyes===3?2:3,ink);
 rect(c,27+(nose===1?1:0),29,nose===2?3:2,nose===3?4:6,shade(skin,-26));
 rect(c,26+(nose===1?1:0),34,nose===2?5:4,2,shade(skin,-34));
 rect(c,24,37,8,1,shade(skin,-44));
 // Hair silhouettes, including receding hairline and bald variants.
 if(cut!==4){
  rect(c,left-1,11,width+2,7,ink);rect(c,left,12,width,6,hair);
  rect(c,left-1,17,4,8,hair);rect(c,left+width-3,17,4,8,hair);
  if(cut===0){rect(c,left+2,10,width-4,4,hair);rect(c,left+6,9,width-12,3,shade(hair,24));}
  if(cut===1){for(let x=left+1;x<left+width;x+=5)rect(c,x,8+(x%3),4,6,hair);}
  if(cut===2){rect(c,left+3,12,5,8,skin);rect(c,left+width-8,12,5,8,skin);}
  if(cut===3){rect(c,left-2,15,5,14,hair);rect(c,left+width-3,15,5,14,hair);rect(c,left+5,9,width-10,5,hair);}
 }else{rect(c,left+2,13,width-4,2,shade(skin,15));}
 // Moustache, goatee, stubble or full beard.
 if(beard===1||beard===3||beard===4){rect(c,23,35,5,2,hair);rect(c,29,35,5,2,hair);}
 if(beard===2||beard===3){rect(c,25,39,6,4,hair);}
 if(beard===4){rect(c,left,35,4,6,hair);rect(c,left+width-4,35,4,6,hair);rect(c,left+4,40,width-8,3,hair);}
 // Collar and shoulder stitching.
 rect(c,21,45,5,3,second);rect(c,30,45,5,3,second);
 rect(c,11,48,8,1,shade(shirt,32));rect(c,37,48,8,1,shade(shirt,32));
 c.restore();return true;
}
export const portraitVariantCount=4*5*5*8*8;
