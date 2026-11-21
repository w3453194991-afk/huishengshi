const fs=require('fs');
const base='https://www.kooying.com';
const list=JSON.parse(fs.readFileSync('E:/湖北/_scrape/list_raw.json','utf8'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function clean(s){return s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
async function one(item,idx){
  const url=base+item.href;
  try{
    const r=await fetch(url); const html=await r.text();
    const h1=(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||item.title;
    let seg=html.split(/Related Products/i)[0];
    const di=seg.indexOf('Description');
    if(di>0) seg=seg.slice(di);
    const ps=[...seg.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>clean(m[1])).filter(t=>t.length>40);
    const img=(html.match(/src="(\/kooying\/[^"?]+\.(?:jpg|png|jpeg|webp))/g)||[]).map(s=>s.slice(5,-0).replace(/src="/,''))[0];
    return {...item, name:clean(h1), desc:ps.slice(0,3).join('\n'), img: img||''};
  }catch(e){ return {...item, name:item.title, desc:'', img:''}; }
}
(async()=>{
  const out=new Array(list.length); let i=0;
  const workers=Array.from({length:6},async()=>{
    while(i<list.length){ const k=i++; out[k]=await one(list[k],k); }
  });
  await Promise.all(workers);
  fs.writeFileSync('E:/湖北/_scrape/detail.json', JSON.stringify(out,null,1));
  console.log('done', out.length, 'with desc', out.filter(x=>x.desc).length, 'with img', out.filter(x=>x.img).length);
})();
