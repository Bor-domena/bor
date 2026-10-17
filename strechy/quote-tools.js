(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='denis-strechy-history-v1';
const fmt=n=>new Intl.NumberFormat('cs-CZ').format(n);
function quote(){
  const m=Number($('area').value), svc=$('service');
  if(!Number.isFinite(m)||m<=0||m>100000){$('area').focus();return null}
  const prices=[[70,120],[140,180],[320,390]],rate=prices[Number(svc.value)]||prices[2];
  return {area:m,service:svc.options[svc.selectedIndex].text,low:Math.round(m*rate[0]),high:Math.round(m*rate[1]),
    name:$('leadName').value.trim().slice(0,100),email:$('leadEmail').value.trim().slice(0,160)};
}
function store(kind,q){
  try{
    let data=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(data))data=[];
    data.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),kind,at:new Date().toISOString(),quote:q||null});
    localStorage.setItem(KEY,JSON.stringify(data.slice(-250)));
  }catch(e){}
}
const names={visit:'Návštěva',calc:'Uložená kalkulace',print:'Tisk',pdf:'PDF',share:'Sdílení'};
function fillPrint(q){
  $('psDate').textContent=new Date().toLocaleString('cs-CZ');
  $('psName').textContent=q.name||'Neuvedeno';
  $('psEmail').textContent=q.email||'Neuvedeno';
  $('psArea').textContent=fmt(q.area)+' m²';
  $('psService').textContent=q.service;
  $('psPrice').textContent=fmt(q.low)+'–'+fmt(q.high)+' Kč';
}
function notify(text){const s=$('quoteStatus');s.textContent=text;clearTimeout(window._quoteMessage);window._quoteMessage=setTimeout(()=>s.textContent='',3500)}
function getValid(){const q=quote();if(!q)notify('Zadejte platnou plochu střechy.');return q}
$('calcRecord').addEventListener('click',()=>{const q=getValid();if(!q)return;store('calc',q);notify('Výpočet uložen v tomto prohlížeči.');});
$('leadEmail').addEventListener('input',()=>{$('leadEmail').setCustomValidity('')});
$('printQuote').addEventListener('click',()=>{const q=getValid();if(!q)return;fillPrint(q);store('print',q);window.print()});
$('pdfQuote').addEventListener('click',()=>{const q=getValid();if(!q)return;store('pdf',q);createPDF(q)});
$('share').addEventListener('click',()=>{const q=quote();if(q)store('share',q)},true);
store('visit',null);
function createPDF(q){
  try{
    const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;
    const c=canvas.getContext('2d',{alpha:false});
    c.fillStyle='#ffffff';c.fillRect(0,0,1240,1754);
    c.fillStyle='#1c302d';c.fillRect(0,0,1240,220);
    c.fillStyle='#ffffff';c.font='bold 55px Arial,sans-serif';c.fillText('DENIS STŘECHY',83,102);
    c.font='25px Arial,sans-serif';c.fillStyle='#c4dbd2';c.fillText('Mytí · ochrana · nástřik střech',85,155);
    c.fillStyle='#cc5037';c.fillRect(85,288,105,9);
    c.fillStyle='#1c302d';c.font='bold 49px Arial,sans-serif';c.fillText('Orientační kalkulace',85,375);
    c.fillStyle='#62736c';c.font='26px Arial,sans-serif';c.fillText('Datum: '+new Date().toLocaleString('cs-CZ'),85,432);
    function line(title,value,y){
      c.fillStyle='#6a7874';c.font='24px Arial,sans-serif';c.fillText(title,85,y);
      c.fillStyle='#1c302d';c.font='bold 29px Arial,sans-serif';c.fillText(value,85,y+49);
      c.fillStyle='#e0e5e1';c.fillRect(85,y+75,1070,2);
    }
    line('Jméno / firma',q.name||'Neuvedeno',510);
    line('E-mail',q.email||'Neuvedeno',660);
    line('Vybraná služba',q.service,810);
    line('Plocha střechy',fmt(q.area)+' m²',960);
    c.fillStyle='#eef4ee';c.fillRect(85,1132,1070,198);
    c.fillStyle='#466258';c.font='bold 24px Arial,sans-serif';c.fillText('PŘEDBĚŽNÝ CENOVÝ ROZSAH',121,1194);
    c.fillStyle='#1c302d';c.font='bold 57px Arial,sans-serif';c.fillText(fmt(q.low)+' – '+fmt(q.high)+' Kč',121,1271);
    c.fillStyle='#6b7871';c.font='24px Arial,sans-serif';
    c.fillText('Jde pouze o orientační odhad, nikoli závaznou nabídku.',85,1410);
    c.fillText('Konečná cena závisí na stavu a sklonu střechy, druhu krytiny',85,1453);
    c.fillText('a přístupu k objektu. Ceny nejsou potvrzením zakázky.',85,1496);
    c.fillStyle='#1c302d';c.fillRect(85,1588,1070,3);
    c.font='22px Arial,sans-serif';c.fillText('DENIS STŘECHY   •   Orientační výpočet z webu',85,1643);
    const raw=atob(canvas.toDataURL('image/jpeg',0.89).split(',')[1]);
    const img=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)img[i]=raw.charCodeAt(i);
    const enc=new TextEncoder(), parts=[];let pos=0;const offsets=[0];
    const add=b=>{parts.push(b);pos+=b.byteLength};
    const addText=s=>add(enc.encode(s));
    const object=(id,txt)=>{offsets[id]=pos;addText(id+' 0 obj\n'+txt+'\nendobj\n')};
    addText('%PDF-1.4\n');
    object(1,'<< /Type /Catalog /Pages 2 0 R >>');
    object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4]=pos;
    addText('4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.length+' >>\nstream\n');
    add(img);addText('\nendstream\nendobj\n');
    const stream='q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n';
    object(5,'<< /Length '+enc.encode(stream).length+' >>\nstream\n'+stream+'endstream');
    const xref=pos;addText('xref\n0 6\n0000000000 65535 f \n');
    for(let i=1;i<=5;i++)addText(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
    addText('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
    const blob=new Blob(parts,{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='denis-strechy-kalkulace-'+new Date().toISOString().slice(0,10)+'.pdf';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);notify('PDF staženo.');
  }catch(e){console.warn('PDF export:',e);notify('PDF nelze stáhnout, použijte Tisk → Uložit jako PDF.')}
}
})();