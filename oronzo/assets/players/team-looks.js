/* ORONZO / AGENT 01 R02 — stable, material-based kits for full-field QA.
 * Pure appearance catalogue: no player IDs, no simulation or club identity.
 * Browser: window.OronzoTeamLooks; Node CommonJS: module.exports.
 */
(function (root) {
  "use strict";
  const SKINS=["#E6B485","#BD8058","#F0C998","#98633F","#D59A70","#B87451","#A87552","#E2AF7A"];
  const HAIR=["#292022","#6D422B","#2C252C","#9C6737","#49271D","#C49259","#201D20","#594131"];
  const KITS=Object.freeze({
    home:Object.freeze({
      shirt:"#F4F0DE",shirtB:"#234BB1",pattern:"vertical",
      shorts:"#27498A",socks:"#F4F2DF",boots:"#1D2334",gloves:"#E8DFB5"
    }),
    away:Object.freeze({
      shirt:"#B63246",shirtB:"#742132",pattern:"solid",
      shorts:"#EEE7D4",socks:"#B63246",boots:"#1A2029",gloves:"#E8DFB5"
    }),
    homeKeeper:Object.freeze({
      shirt:"#EAB83B",shirtB:"#EAB83B",pattern:"solid",
      shorts:"#2C3742",socks:"#EAB83B",boots:"#202836",gloves:"#F2E6CE"
    }),
    awayKeeper:Object.freeze({
      shirt:"#35959B",shirtB:"#35959B",pattern:"solid",
      shorts:"#223A55",socks:"#B4F0E1",boots:"#17263C",gloves:"#F7EFE0"
    })
  });
  function appearance(team,index,keeper=false){
    if(team!=="home"&&team!=="away")throw new TypeError("team must be home or away");
    if(!Number.isInteger(index)||index<0||index>10)throw new RangeError("index must be 0..10");
    const slot=(index*5+(team==="away"?3:0))%SKINS.length;
    const hairSlot=(index*3+(team==="away"?5:0))%HAIR.length;
    const kit=keeper?(team==="home"?KITS.homeKeeper:KITS.awayKeeper):KITS[team];
    return {...kit,skin:SKINS[slot],hair:HAIR[hairSlot]};
  }
  function roster() {
    return ["home","away"].flatMap(team=>Array.from({length:11},(_,index)=>({
      id:(team==="home"?"H":"A")+index,team,index,keeper:index===0,
      appearance:appearance(team,index,index===0)
    })));
  }
  const api={KITS,SKINS,HAIR,appearance,roster};
  root.OronzoTeamLooks=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
