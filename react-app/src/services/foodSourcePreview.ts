// Reuse an established WIZ action so the preview is available without a
// process restart when this project is hot-deployed.
const FOOD_SOURCE_PREVIEW_API='/wiz/api/page.home/portal_positions';

type FoodSourcePreviewResponse={
  code?:number;
  data?:{html?:string;sourceUrl?:string;message?:string};
};

const FOOD_SOURCE_HOSTS=new Set(['www.diningcode.com','diningcode.com','www2.sejong.go.kr','www.sjlocal.or.kr','sjlocal.or.kr']);
const PERFORMANCE_SOURCE_HOSTS=new Set(['www.sjac.or.kr','sjac.or.kr']);
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
const renderInlineMarkdown=(value:string)=>escapeHtml(value)
  .replace(/\[([^\]]+)]\([^)]+\)/g,'$1')
  .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');

const renderReaderDocument=(markdown:string,sourceUrl:string)=>{
  const body=markdown.split(/\r?\n/).map(line=>{
    const image=line.match(/^!\[(.*?)]\((https:\/\/[^\s)]+)\)$/);
    if(image)return `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy"><figcaption>${escapeHtml(image[1])}</figcaption></figure>`;
    const heading=line.match(/^(#{1,4})\s+(.+)$/);
    if(heading){const level=Math.min(4,heading[1].length);return `<h${level}>${escapeHtml(heading[2])}</h${level}>`}
    if(!line.trim())return '<div class="reader-space"></div>';
    const formatted=renderInlineMarkdown(line);
    return `<p>${formatted}</p>`;
  }).join('');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>원본 페이지 읽기</title><style>body{max-width:920px;margin:0 auto;padding:24px;background:#fff;color:#243c36;font:14px/1.75 system-ui,sans-serif}header{position:sticky;top:0;z-index:2;margin:-24px -24px 24px;padding:14px 24px;border-bottom:1px solid #dfe9e5;background:#ffffffee;backdrop-filter:blur(8px)}header small{display:block;color:#2f9168;font-weight:800}header span{display:block;overflow-wrap:anywhere;color:#6b7f78;font-size:11px}h1,h2,h3,h4{line-height:1.35}p{margin:5px 0;overflow-wrap:anywhere}figure{margin:18px 0;padding:12px;border-radius:14px;background:#f3f7f5}img{display:block;max-width:100%;height:auto;margin:auto;border-radius:10px}figcaption{margin-top:8px;color:#6b7f78;font-size:11px}.reader-space{height:10px}</style></head><body><header><small>현재 원본 웹 읽기 화면</small><span>${escapeHtml(sourceUrl)}</span></header>${body}</body></html>`;
};

export const cleanPerformanceReaderMarkdown=(markdown:string)=>{
  const lines=markdown.replace(/^\uFEFF/,'').split(/\r?\n/);
  const firstPoster=lines.findIndex(line=>/^!\[[^\]]*]\(https:\/\/www\.sjac\.or\.kr\/storage\//.test(line.trim()));
  const firstVenue=lines.findIndex(line=>/^#{2,4}\s+세종예술의전당\s*$/.test(line.trim()));
  const contentMarker=lines.findIndex(line=>/^Markdown Content:\s*$/.test(line.trim()));
  const start=firstPoster>=0?firstPoster:firstVenue>=0?firstVenue:Math.max(0,contentMarker+1);
  return lines.slice(start).filter(line=>{
    const normalized=line.trim();
    return !/^(Title|URL Source|Markdown Content):/.test(normalized)
      && !/바로가기 메뉴|본문내용 바로가기|메인메뉴 바로가기|모두보기 닫기/.test(normalized)
      && !/^##\s+프로그램\s*$/.test(normalized);
  }).join('\n').trim();
};

export const renderPerformanceReaderDocument=(markdown:string)=>{
  const cleaned=cleanPerformanceReaderMarkdown(markdown);
  const body=cleaned.split(/\r?\n/).map(line=>{
    const trimmed=line.trim();
    const image=trimmed.match(/^!\[(.*?)]\((https:\/\/[^\s)]+)\)$/);
    if(image)return `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`;
    const heading=trimmed.match(/^(#{1,4})\s+(.+)$/);
    if(heading){const level=Math.min(3,heading[1].length);return `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`}
    const label=trimmed.match(/^\*\s+\*\*(.+?)\*\*\s*$/);
    if(label)return `<h4>${renderInlineMarkdown(label[1])}</h4>`;
    if(!trimmed)return '<div class="reader-space"></div>';
    if(/^[•·]\s*/.test(trimmed))return `<p class="reader-note">${renderInlineMarkdown(trimmed.replace(/^[•·]\s*/,''))}</p>`;
    return `<p>${renderInlineMarkdown(trimmed)}</p>`;
  }).join('');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>공연 상세 정보</title><style>*{box-sizing:border-box}body{max-width:820px;margin:0 auto;padding:24px;background:#f5f8f7;color:#213b35;font:14px/1.7 system-ui,sans-serif}header{margin:-24px -24px 22px;padding:18px 24px;border-bottom:1px solid #dce7e3;background:#fff}header small{display:block;color:#39816e;font-size:11px;font-weight:900;letter-spacing:.08em}header strong{display:block;margin-top:2px;font-size:18px}main{padding:22px;border:1px solid #dfe8e5;border-radius:18px;background:#fff;box-shadow:0 10px 28px #173c3220}h1,h2,h3{margin:22px 0 10px;line-height:1.35}h1:first-of-type,h2:first-of-type,h3:first-of-type{margin-top:0}h4{margin:14px 0 2px;color:#347663;font-size:12px}p{margin:4px 0;overflow-wrap:anywhere}strong{font-weight:900}figure{margin:0 0 22px;padding:10px;border-radius:14px;background:#eef4f1}img{display:block;max-width:100%;height:auto;margin:auto;border-radius:10px}.reader-note{margin:8px 0;padding:9px 11px;border-left:3px solid #75ad9e;background:#f4f8f6}.reader-space{height:8px}</style></head><body><header><small>SEJONG ARTS CENTER</small><strong>공연 상세 정보</strong></header><main>${body||'<p>공연 상세 정보를 준비하고 있어요.</p>'}</main></body></html>`;
};

const loadSourceReader=async(url:string,allowedHosts:Set<string>,invalidMessage:string,renderer:(markdown:string,sourceUrl:string)=>string=renderReaderDocument)=>{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||!allowedHosts.has(parsed.hostname))throw new Error(invalidMessage);
  const readerUrl=`https://r.jina.ai/http://${parsed.host}${parsed.pathname}${parsed.search}`;
  const response=await fetch(readerUrl,{credentials:'omit',headers:{Accept:'text/plain'}});
  const markdown=await response.text();
  if(!response.ok||!markdown.trim())throw new Error('원본 페이지를 현재 화면으로 불러오지 못했어요.');
  return {html:renderer(markdown,url),sourceUrl:url};
};

async function loadSourcePreview(url:string,field:'foodSourceUrl'|'performanceSourceUrl',allowedHosts:Set<string>,invalidMessage:string,fallbackRenderer:(markdown:string,sourceUrl:string)=>string=renderReaderDocument){
  try{
    const response=await fetch(FOOD_SOURCE_PREVIEW_API,{
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body:new URLSearchParams({[field]:url}),
    });
    const body=await response.json().catch(()=>null) as FoodSourcePreviewResponse|null;
    const html=body?.data?.html;
    if(!response.ok||body?.code!==200||typeof html!=='string'||!html.trim())throw new Error(body?.data?.message);
    return {html,sourceUrl:body.data?.sourceUrl??url};
  }catch{
    return loadSourceReader(url,allowedHosts,invalidMessage,fallbackRenderer);
  }
}

export const loadFoodSourcePreview=(url:string)=>loadSourcePreview(url,'foodSourceUrl',FOOD_SOURCE_HOSTS,'허용된 먹거리 정보 출처만 확인할 수 있어요.');
export const loadPerformanceSourcePreview=(url:string)=>loadSourcePreview(url,'performanceSourceUrl',PERFORMANCE_SOURCE_HOSTS,'허용된 공연 정보 출처만 확인할 수 있어요.',renderPerformanceReaderDocument);
