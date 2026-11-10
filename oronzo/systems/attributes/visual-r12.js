/** R12 canonical, deterministic cosmetics. Historical player portraits are fictional,
 * source artwork remains the original Agent01 indexed PNG atlas. */
export const SKIN_COLORS_R12=Object.freeze(['#E6B485','#BD8058','#F0C998','#98633F','#D59A70','#B87451','#A87552','#E2AF7A']);
export const HAIR_COLORS_R12=Object.freeze(['#292022','#6D422B','#2C252C','#9C6737','#49271D','#C49259','#201D20','#594131']);
const HAIR_STYLES=['crop','side-part','wavy','curly','receding','buzz','long','bald'];
const FACIAL_HAIR=['shaved','moustache','goatee','stubble','full-beard'];
const SHIRT_PATTERNS=['solid','vertical','horizontal','halves'];
const SHIRT_COLORS=['#284E9A','#A12D32','#F0DFAE','#247260','#E3A735','#623B86','#3E6695','#B75527','#E3E3DE','#25334D','#AF4774','#4D793D'];
const trim='#EEE4CB';
function hash(s){let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;}
function draw(s,n){return hash(s)%n;}
export function createPlayerVisualR12(playerId,seed){
  if(typeof playerId!=='string'||!playerId)throw new Error('R12_PLAYER_ID_REQUIRED');
  if(!Number.isSafeInteger(seed))throw new Error('R12_SEED_REQUIRED');
  const id=seed+':'+playerId;
  const hairStyleId=HAIR_STYLES[draw(id+':hair-style',HAIR_STYLES.length)];
  return {schemaVersion:1,source:'r12-deterministic-player-id',skinToneId:draw(id+':skin',SKIN_COLORS_R12.length),
    hairColorId:draw(id+':hair',HAIR_COLORS_R12.length),hairStyleId,
    facialHairStyleId:FACIAL_HAIR[draw(id+':face-hair',FACIAL_HAIR.length)],
    facialHairColorId:draw(id+':facial-color',HAIR_COLORS_R12.length),
    faceVariantId:draw(id+':face-shape',6),portraitAssetId:null};
}
export function createClubKitsR12(clubId,seed){
  if(!clubId)throw new Error('R12_CLUB_ID_REQUIRED');
  const id=seed+':'+clubId;
  const primary=SHIRT_COLORS[draw(id+':primary',SHIRT_COLORS.length)];
  let secondary=SHIRT_COLORS[draw(id+':secondary',SHIRT_COLORS.length)];
  if(primary===secondary)secondary=SHIRT_COLORS[(draw(id+':secondary',SHIRT_COLORS.length)+5)%SHIRT_COLORS.length];
  const pattern=SHIRT_PATTERNS[draw(id+':pattern',SHIRT_PATTERNS.length)];
  const shorts=SHIRT_COLORS[draw(id+':shorts',SHIRT_COLORS.length)];
  const socks=SHIRT_COLORS[draw(id+':socks',SHIRT_COLORS.length)];
  return {source:'r12-fictional-club-kit',
    home:{shirtA:primary,shirtB:secondary,shirtPatternId:pattern,shorts,socks,trim},
    away:{shirtA:secondary,shirtB:primary,shirtPatternId:pattern==='solid'?'vertical':'solid',shorts:primary,socks:secondary,trim},
    keeper:{shirtA:'#D9B849',shirtB:'#D9B849',shirtPatternId:'solid',shorts:'#303D40',socks:'#D9B849',trim}};
}
/** Adds only missing appearances and kits. It never overwrites an authored visual,
 * never assigns a birthplace, and is safe to run repeatedly on old saves. */
export function ensureCareerVisualsR12(state){
  if(!state || !Array.isArray(state.clubs) || !Number.isSafeInteger(state.seed))
    throw new Error('R12_CAREER_REQUIRED');
  let players=0,kits=0;
  for(const club of state.clubs){
    if(!club.visualKits?.home){club.visualKits=createClubKitsR12(club.id,state.seed);kits++;}
    for(const player of club.players||[]){
      if(!player.visual){player.visual=createPlayerVisualR12(player.id,state.seed);players++;}
    }
  }
  if(players||kits){
    state.migrations={...(state.migrations||{}),visualR12:{version:1,method:'seed-and-player-id-missing-only',
      playerCount:players,clubCount:kits,geographyUnmodified:true}};
  }
  return {players,kits};
}
export function appearanceForMatchR12(player,club,{away=false}={}){
  const v=player?.visual;const kit=club?.visualKits;
  if(!v||!kit?.home)return null;
  const selected=player.positions?.includes('GK')?kit.keeper:(away?kit.away:kit.home);
  if(!selected)return null;
  return {skin:SKIN_COLORS_R12[v.skinToneId]||SKIN_COLORS_R12[0],
    hair:HAIR_COLORS_R12[v.hairColorId]||HAIR_COLORS_R12[0],
    facialHairColor:HAIR_COLORS_R12[v.facialHairColorId]||HAIR_COLORS_R12[0],
    hairStyleId:v.hairStyleId,facialHairStyleId:v.facialHairStyleId,faceVariantId:v.faceVariantId,
    shirt:selected.shirtA,shirtB:selected.shirtB,shorts:selected.shorts,socks:selected.socks,
    trim:selected.trim,pattern:selected.shirtPatternId};
}
