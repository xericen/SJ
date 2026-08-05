// Reuse an established WIZ action so the preview is available without a
// process restart when this project is hot-deployed.
const FOOD_SOURCE_PREVIEW_API='/wiz/api/page.home/portal_positions';

type FoodSourcePreviewResponse={
  code?:number;
  data?:{html?:string;sourceUrl?:string;message?:string};
};

const FOOD_SOURCE_HOSTS=new Set(['www.diningcode.com','diningcode.com','www2.sejong.go.kr','www.sjlocal.or.kr','sjlocal.or.kr']);
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));

const renderReaderDocument=(markdown:string,sourceUrl:string)=>{
  const body=markdown.split(/\r?\n/).map(line=>{
    const image=line.match(/^!\[(.*?)]\((https:\/\/[^\s)]+)\)$/);
    if(image)return `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy"><figcaption>${escapeHtml(image[1])}</figcaption></figure>`;
    const heading=line.match(/^(#{1,4})\s+(.+)$/);
    if(heading){const level=Math.min(4,heading[1].length);return `<h${level}>${escapeHtml(heading[2])}</h${level}>`}
    if(!line.trim())return '<div class="reader-space"></div>';
    const formatted=escapeHtml(line).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    return `<p>${formatted}</p>`;
  }).join('');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>원본 페이지 읽기</title><style>body{max-width:920px;margin:0 auto;padding:24px;background:#fff;color:#243c36;font:14px/1.75 system-ui,sans-serif}header{position:sticky;top:0;z-index:2;margin:-24px -24px 24px;padding:14px 24px;border-bottom:1px solid #dfe9e5;background:#ffffffee;backdrop-filter:blur(8px)}header small{display:block;color:#2f9168;font-weight:800}header span{display:block;overflow-wrap:anywhere;color:#6b7f78;font-size:11px}h1,h2,h3,h4{line-height:1.35}p{margin:5px 0;overflow-wrap:anywhere}figure{margin:18px 0;padding:12px;border-radius:14px;background:#f3f7f5}img{display:block;max-width:100%;height:auto;margin:auto;border-radius:10px}figcaption{margin-top:8px;color:#6b7f78;font-size:11px}.reader-space{height:10px}</style></head><body><header><small>현재 원본 웹 읽기 화면</small><span>${escapeHtml(sourceUrl)}</span></header>${body}</body></html>`;
};

const loadFoodSourceReader=async(url:string)=>{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||!FOOD_SOURCE_HOSTS.has(parsed.hostname))throw new Error('허용된 먹거리 정보 출처만 확인할 수 있어요.');
  const readerUrl=`https://r.jina.ai/http://${parsed.host}${parsed.pathname}${parsed.search}`;
  const response=await fetch(readerUrl,{credentials:'omit',headers:{Accept:'text/plain'}});
  const markdown=await response.text();
  if(!response.ok||!markdown.trim())throw new Error('원본 페이지를 현재 화면으로 불러오지 못했어요.');
  return {html:renderReaderDocument(markdown,url),sourceUrl:url};
};

export async function loadFoodSourcePreview(url:string){
  try{
    const response=await fetch(FOOD_SOURCE_PREVIEW_API,{
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body:new URLSearchParams({foodSourceUrl:url}),
    });
    const body=await response.json().catch(()=>null) as FoodSourcePreviewResponse|null;
    const html=body?.data?.html;
    if(!response.ok||body?.code!==200||typeof html!=='string'||!html.trim())throw new Error(body?.data?.message);
    return {html,sourceUrl:body.data?.sourceUrl??url};
  }catch{
    return loadFoodSourceReader(url);
  }
}
