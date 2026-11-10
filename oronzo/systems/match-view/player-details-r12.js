/** R12 original 1-pixel face details over the existing Agent01 32px sprite.
 * Hair, beard and facial-variation pixels are cosmetic only: no game logic.
 * The canonical identity belongs to player.visual, independent of team kits. */
export function drawPlayerFaceDetailsR12(ctx,{x,y,direction='S',appearance}={}){
 if(!ctx||!appearance||!appearance.hairStyleId)return false;
 const xx=Math.round(x),yy=Math.round(y);
 const hair=appearance.hair||'#342723';
 const facial=appearance.facialHairColor||hair;
 const skin=appearance.skin||'#DCA06B';
 const style=appearance.hairStyleId;
 const beard=appearance.facialHairStyleId;
 const back=direction==='N'||direction==='NE'||direction==='NW';
 const side=direction==='E'||direction==='W';
 const at=(color,ox,oy,w=1,h=1)=>{ctx.fillStyle=color;ctx.fillRect(xx+ox,yy+oy,w,h);};
 // The two top pixels vary with the persistent style. Bald heads are uncovered.
 if(style==='bald'){
  at(skin,-2,-24,4,2);
 }else if(style==='buzz'){
  at(hair,-2,-24,4,1);
 }else if(style==='crop'){
  at(hair,-3,-25,6,1);
 }else if(style==='side-part'){
  at(hair,-3,-25,5,2);at(skin,1,-25,2,1);
 }else if(style==='wavy'||style==='curly'){
  at(hair,-3,-25,2,2);at(hair,1,-25,2,2);
  if(style==='curly')at(hair,-1,-26,2,1);
 }else if(style==='receding'){
  at(hair,-3,-24,2,2);at(hair,2,-24,1,2);
 }else if(style==='long'){
  at(hair,-3,-25,6,2);at(hair,-4,-22,1,6);at(hair,3,-22,1,6);
 }
 if(back||!beard||beard==='shaved')return true;
 if(beard==='moustache'){at(facial,-2,-16,4,1);}
 else if(beard==='goatee'){at(facial,-1,-15,2,3);}
 else if(beard==='stubble'){at(facial,-3,-14,2,1);at(facial,2,-14,1,1);at(facial,-1,-13,2,1);}
 else if(beard==='full-beard'){
  at(facial,-3,-16,1,4);at(facial,2,-16,1,4);at(facial,-2,-13,4,2);
 }
 if(!side&&Number.isInteger(appearance.faceVariantId)){
  const v=appearance.faceVariantId;
  if(v%3===0)at('#553A35',-1,-18,1,1);
  if(v%3===1)at('#704B3D',1,-18,1,1);
  if(v%3===2)at('#8C5A45',0,-17,1,1);
 }
 return true;
}
