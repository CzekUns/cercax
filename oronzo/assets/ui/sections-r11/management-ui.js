/** ORONZO 07B R11 · UI-only consumer of Career07 management.
 * Buttons have no local finances or pseudo-operations: caller handles all actions.
 */
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const F=x=>Number.isFinite(x)?new Intl.NumberFormat('it-IT').format(x):'—';
const B=(t,a,v='')=>'<button class="ui-btn" type="button" data-action="'+E(a)+'" data-value="'+E(v)+'">'+E(t)+'</button>';
const row=(k,v)=>'<div class="r11-manager-stat"><small>'+E(k)+'</small><b>'+E(v)+'</b></div>';
const fmtPrice=n=>Number.isFinite(n)?F(n)+' ₤':'non registrato';
const status=v=>'<span class="r11-status-chip">'+E(v||'—')+'</span>';
export function renderPresidentOperations({club,profile,window,candidates=[],tab='ufficio',backendReady=false,otherClubs=[]}={}){
 const c=club||{},m=c.management||{},requests=m.requests||[],transfers=c.market?.requests||[];
 const nav='<div class="r11-tabs r11-pres-tabs">'+
  B('UFFICIO','pres-tab','ufficio')+B('MERCATO','pres-tab','mercato')+'</div>';
 const lastRequest=requests.slice(-5).reverse().map(x=>'<div class="r11-manager-row">'+
  '<span><b>'+E(x.kind)+'</b><small>'+E(fmtPrice(x.amountITL))+' · '+E(x.decisionReason||'in attesa')+'</small></span>'+
  (x.status==='pending'&&backendReady?B('DECIDI','board-decide',x.id):status(x.status))+'</div>').join('');
 let body='';
 if(tab==='ufficio'){
  body='<div class="r11-manager-summary">'+
   row('Presidente',profile?.name||'non disponibile')+
   row('Fiducia società',c.boardTrust??'—')+
   row('Papponeria',c.boardTraits?.papponeria??'non registrata')+
   row('Liquidità',fmtPrice(c.finance?.cash))+
   row('Arretrati',fmtPrice(c.finance?.arrears))+
   row('Qualità allenamenti',m.trainingQuality??'non registrata')+'</div>'+
   '<div class="r11-management-form"><label>TIPO DI RICHIESTA<select id="r11-request-kind">'+
    '<option value="stadium_repair">MANUTENZIONE STADIO</option>'+
    '<option value="training_facilities">STRUTTURE ALLENAMENTO</option>'+
    '<option value="market_mandate">MANDATO MERCATO</option></select></label>'+
   '<label>IMPORTO IN LIRE<input id="r11-request-amount" type="number" min="1" step="1000" value="100000"></label>'+
   (backendReady?B('INVIA RICHIESTA','board-request'):status('CONTRATTO CAREER07 NON INTEGRATO'))+'</div>'+
   '<div class="r11-manager-history"><strong>DECISIONI UFFICIALI</strong>'+lastRequest+
   (lastRequest?'':'<p>Nessuna richiesta registrata.</p>')+'</div>';
 }else{
  const open=window?.open===true,reason=open?'FINESTRA DI GIOCO APERTA':'FINESTRA DI GIOCO CHIUSA';
  const mandates=requests.filter(x=>x.kind==='market_mandate'&&x.status==='approved');
  const options=candidates.map(x=>'<option value="'+E(x.clubId)+'|'+E(x.playerId)+'">'+
   E(x.name)+' · '+E(x.clubName)+' · '+E(x.positions?.join('/')||'—')+'</option>').join('');
  const ownOptions=(c.players||[]).map(x=>'<option value="'+E(x.id)+'">'+E(x.name)+'</option>').join('');
  const buyerOptions=otherClubs.filter(x=>x.id!==c.id).map(x=>
   '<option value="'+E(x.id)+'">'+E(x.name)+'</option>').join('');
  const mandateOptions=mandates.map(x=>'<option value="'+E(x.id)+'">'+E(x.id)+' · '+E(fmtPrice(x.amountITL))+'</option>').join('');
  body='<div class="r11-manager-window"><b>'+E(reason)+'</b><small>'+
   'Finestre definite come ipotesi di gameplay, non calendario storico 1979. '+E(window?.id||'')+'</small></div>'+
   '<div class="r11-market-split"><div class="r11-management-form">'+
   '<strong>PROPOSTA DI ACQUISTO</strong><label>CALCIATORE<select id="r11-market-candidate">'+options+'</select></label>'+
   '<label>MANDATO APPROVATO<select id="r11-market-mandate">'+mandateOptions+'</select></label>'+
   '<label>OFFERTA ₤<input id="r11-market-fee" type="number" min="0" step="1000" value="50000"></label>'+
   '<label>INGAGGIO / SETT. ₤<input id="r11-market-wage" type="number" min="0" step="1000" value="4000"></label>'+
   (backendReady&&open&&mandates.length&&options?B('PROPOSTA','market-request'):status(!open?'CHIUSO':'MANDATO RICHIESTO'))+
   '</div><div class="r11-management-form"><strong>PROPOSTA DI CESSIONE</strong>'+
   '<label>CALCIATORE<select id="r11-sale-player">'+ownOptions+'</select></label>'+
   '<label>SOCIETÀ ACQUIRENTE<select id="r11-sale-buyer">'+buyerOptions+'</select></label>'+
   '<label>PREZZO ₤<input id="r11-sale-fee" type="number" min="0" step="1000" value="50000"></label>'+
   (backendReady&&open?B('METTI IN VENDITA','market-sale'):status('FUORI FINESTRA'))+
   '</div></div><div class="r11-manager-history"><strong>PRATICHE DI MERCATO</strong>'+
   transfers.slice(-8).reverse().map(x=>'<div class="r11-manager-row"><span><b>'+
    E(x.kind==='buy'?'ACQUISTO':'CESSIONE')+' · '+E(x.player?.name||x.playerId)+'</b>'+
    '<small>'+E(x.status)+' · '+E(x.id)+'</small></span>'+
    (backendReady&&open&&x.status==='proposed'?B('VALUTA','market-progress','review|'+x.id):
     backendReady&&open&&x.status==='approved'?B(x.kind==='sell'?'CEDI':'NEGOZIA','market-progress',
       (x.kind==='sell'?'finalize-sale':'negotiate')+'|'+x.id):
     backendReady&&open&&x.status==='negotiated'?B('ACQUISTA','market-progress','finalize|'+x.id):
     status(x.status))+'</div>').join('')+
   (transfers.length?'':'<p>Nessuna pratica registrata.</p>')+'</div>';
 }
 return '<div class="r11-president-page"><section class="panel r11-president-panel">'+
 '<div class="panel-title">PRESIDENTE · '+E(profile?.name||'SOCIETÀ')+'</div>'+nav+
 '<div class="r11-column-scroll">'+body+'</div>'+
 '<div class="r11-bottom">'+B('UFFICIO','hub')+B('SALVA','save')+'</div></section></div>';
}
