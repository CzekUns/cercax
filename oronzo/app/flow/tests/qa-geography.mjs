/** SYNTHETIC TEST DATA ONLY. These are deliberately fictional place names and IDs.
 * No assertion of ISTAT verification, historic 1979 municipalities or real licensing.
 * Only used in Node tests and the explicit QA demo.
 */
export function qaMunicipalityCatalog() {
  const sources=[{
    id:'SYNTHETIC-QA-ONLY',
    url:'https://example.test/oronzo-synthetic-fixture',
    publisher:'ORONZO internal unit-test generator (NOT ISTAT)',
    license:'synthetic-fixture-internal-only'
  }];
  const municipalities=Array.from({length:100},(_,index)=>{
    const south=index%2===0;
    return {
      municipalityId:String(index+1).padStart(6,'0'),
      municipalityName:'QA FICTITIOUS PLACE '+String(index+1).padStart(3,'0'),
      provinceCode:south?'NA':'TO',
      regionId:south?'campania':'piemonte',
      macroRegion:south?'south':'north',
      population:1000+index,
      populationReferenceYear:2025,
      sourceId:sources[0].id
    };
  });
  return {datasetId:'SYNTHETIC_QA_ONLY_NOT_ISTAT',
    version:'R06-test-1',qaFixture:true,reviewStatus:'approved',
    sources,municipalities};
}
export const qaAvatar={
  id:'qa-coach-r06',
  traits:{luck:80,leadership:85,selfEsteem:80,patience:84},
  origin:{municipalityId:'000001',regionId:'campania',macroRegion:'sud'}
};
