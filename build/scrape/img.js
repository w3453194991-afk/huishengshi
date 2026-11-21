const fs=require('fs'); const path=require('path');
const base='https://www.kooying.com';
const list=JSON.parse(fs.readFileSync('E:/湖北/_scrape/list_raw.json','utf8'));
const dir='E:/湖北/冠英数据中台/assets/img/p';
const out={}; let i=0;
async function one(item){
  try{
    const r=await fetch(base+item.href); const html=await r.text();
    const m=[...html.matchAll(/(\/kooying\/[^"'\s>]+\.(?:jpg|jpeg|png))/g)].map(x=>x[1]);
    const img=m.find(x=>!/logo|qr|wechat|template/i.test(x));
    if(!img) return;
    const key=item.href.replace(/^\/product\//,'').replace(/\.html$/,'').replace(/[\\/:*?"<>|]/g,'_');
    const res=await fetch(base+img);
    if(!res.ok) return;
    const buf=Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(dir,key+'.jpg'), buf);
    out[item.href]=key+'.jpg';
  }catch(e){}
}
(async()=>{
  const workers=Array.from({length:8},async()=>{ while(i<list.length){ const k=i++; await one(list[k]); } });
  await Promise.all(workers);
  fs.writeFileSync('E:/湖北/_scrape/imgmap.json', JSON.stringify(out,null,1));
  console.log('imgs', Object.keys(out).length);
})();
