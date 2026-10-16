(()=>{
  'use strict';
  const API='https://zdradop-sklad-kalkulacka.smokypond2.chatgpt.site/api/events';
  let sessionId=crypto.randomUUID();
  try{sessionId=sessionStorage.getItem('zdradop-session-v1')||sessionId;sessionStorage.setItem('zdradop-session-v1',sessionId)}catch(e){}
  const queueKey='zdradop-history-outbox-v1';
  let queue=[];try{queue=JSON.parse(localStorage.getItem(queueKey)||'[]');if(!Array.isArray(queue))queue=[]}catch(e){}
  queue=queue.filter(e=>e&&Date.now()-e.created<7*86400000).slice(-100);
  let sending=false,lastPrint=0;
  const status=document.getElementById('historyStatus');
  function persist(){try{localStorage.setItem(queueKey,JSON.stringify(queue))}catch(e){}}
  function setStatus(failed){if(status)status.textContent=failed?'Záznam historie čeká na připojení.':'Přístupy a kliknutí na Uložit / Tisk se zaznamenávají.'}
  async function flush(){
    if(sending||!queue.length)return;sending=true;
    try{while(queue.length){const response=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'omit',body:JSON.stringify(queue[0].event),keepalive:true,signal:AbortSignal.timeout(10000)});if(!response.ok){if(response.status>=400&&response.status<500&&response.status!==429){queue.shift();persist();continue}throw Error('History unavailable')}queue.shift();persist()}setStatus(false)}catch(e){setStatus(true)}finally{sending=false}
  }
  function record(kind){
    if(kind==='print'){if(Date.now()-lastPrint<2000)return;lastPrint=Date.now()}
    const snapshot=kind==='visit'?null:(typeof current!=='undefined'&&current?JSON.parse(JSON.stringify(current)):null);
    if(kind!=='visit'&&!snapshot)return;
    queue.push({created:Date.now(),event:{id:crypto.randomUUID(),sessionId,kind,snapshot}});queue=queue.slice(-100);persist();void flush();
  }
  document.getElementById('save').addEventListener('click',()=>record('save'));
  document.getElementById('print').addEventListener('click',()=>record('print'),{capture:true});
  window.addEventListener('beforeprint',()=>record('print'));
  window.addEventListener('online',flush);setInterval(flush,30000);
  setStatus(false);record('visit');
})();
