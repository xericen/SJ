export const festivalImageUrl=(url:string,baseUrl:string)=>{
  if(!url.startsWith('/images/'))return url;
  return `${baseUrl.replace(/\/?$/,'/')}${url.slice(1)}`;
};

export const festivalKakaoMapSearchUrl=(address:string)=>
  `https://map.kakao.com/link/search/${encodeURIComponent(address.trim())}`;
