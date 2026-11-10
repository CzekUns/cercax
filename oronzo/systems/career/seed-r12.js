/** A seed is generated once when the user presses NUOVA PARTITA, then stored
 * in state.seed and rngState.seed by controller07. No random data on reload. */
export function newCareerSeedR12({query='',cryptoSource=globalThis.crypto,clock=()=>Date.now(),random=Math.random}={}){
 const requested=new URLSearchParams(query).get('seed');
 if(requested!==null){
   if(!/^[0-9]{1,16}$/.test(requested)||!Number.isSafeInteger(Number(requested)))
     throw new RangeError('R12_INVALID_TEST_SEED');
   return Number(requested); // Explicit opt-in: ?seed=1979 reproduces any QA world.
 }
 if(cryptoSource?.getRandomValues){
   const data=new Uint32Array(2);
   cryptoSource.getRandomValues(data);
   return (data[0] & 0x1fffff)*4294967296+data[1];
 }
 // Non-secure static preview fallback; still generated once per NEW PARTITA.
 return (Math.floor(clock())*1009+Math.floor(random()*0xffffffff))%Number.MAX_SAFE_INTEGER;
}
