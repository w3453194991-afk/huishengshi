const fs=require('fs');
const base='https://www.kooying.com';
const out=[];
const seen=new Set();
function clean(s){return s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
(async()=>{
 for(let p=1;p<=23;p++){
  const url=base+'/product/page/'+p+'/';
  let html;
  try{ const r=await fetch(url); html=await r.text(); }catch(e){ console.error('fail',p,e.message); continue; }
  const re=/<h3[^>]*>\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const imgRe=/src="(\/kooying\/[^"?]+\.(?:jpg|png|jpeg|webp))/g;
  let m, count=0;
  const imgs=[...html.matchAll(imgRe)].map(x=>x[1]);
  while((m=re.exec(html))){
    const href=m[1], title=clean(m[2]);
    if(!href.startsWith('/product/')||href==='/product/') continue;
    if(seen.has(href)) continue;
    seen.add(href);
    out.push({href, title, page:p});
    count++;
  }
  console.error('page',p,'items',count);
 }
 fs.writeFileSync('E:/湖北/_scrape/list_raw.json', JSON.stringify(out,null,1));
 console.log('total', out.length);
})();
