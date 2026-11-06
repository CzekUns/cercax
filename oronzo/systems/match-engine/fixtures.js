// Entirely synthetic player and club data for an independently runnable demo.
function player(teamId,i,strength) {
  const v=(offset)=>Math.max(1,Math.min(99,strength+offset+(i%5)*2-4));
  return {
    id:teamId+'-'+i,name:['Nino','Arturo','Vito','Leone','Berto','Lino','Remo','Dino','Sandro','Mauro','Pietro','Fabio','Dario','Aldo','Gino'][i]+' '+teamId,
    teamId,age:21+i%13,positions:[i===0?'GK':i<=4?'DF':i<=8?'MF':'ST'],
    technical:{passing:v(1),shooting:v(0),control:v(2),tackling:v(0),
      positioning:v(3),decisions:v(0),goalkeeping:i===0?v(12):v(-40)},
    physical:{pace:v(1),stamina:v(5),strength:v(0),durability:v(8)},
    mental:{composure:v(0),discipline:v(4),teamwork:v(2),
      confidence:v(0),morale:v(0),luck:50+i%5,character:v(0)},
    status:{fatigue:i%5,fitness:95,health:100,injuryDays:0,suspensionMatches:0}
  };
}
function club(id,name,strength) {
  return {id,name,divisionId:'C1',budget:1000000,wageBudget:200000,
    boardTrust:60,seasonObjective:'midTable',presidentId:id+'-president',
    players:Array.from({length:15},(_,i)=>player(id,i,strength))};
}
export function makeFixture(seed=42,options={}) {
  const homeClub=club('montevento','Montevento',options.homeStrength??62);
  const awayClub=club('portoselva','Porto Selva',options.awayStrength??62);
  return {
    seed,homeClub,awayClub,
    homeXI:homeClub.players.slice(0,11).map(p=>p.id),
    awayXI:awayClub.players.slice(0,11).map(p=>p.id),
    homeBench:homeClub.players.slice(11).map(p=>p.id),
    awayBench:awayClub.players.slice(11).map(p=>p.id),
    homeTactics:options.homeTactics??{formation:'4-4-2',mentality:50,pressing:50,tempo:50,width:50,marking:'zonal'},
    awayTactics:options.awayTactics??{formation:'4-3-3',mentality:48,pressing:52,tempo:52,width:55,marking:'zonal'},
    competitionRules:{maxSubstitutions:options.maxSubstitutions??2},
  };
}
