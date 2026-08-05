export const ARTS_CENTER_FAVORITES_STORAGE_KEY='sejong-arts-center-favorites-v1';

export const parseArtsCenterFavorites=(value:string|null)=>{
  if(!value)return [];
  try{
    const parsed=JSON.parse(value);
    return Array.isArray(parsed)?parsed.filter((index):index is number=>Number.isInteger(index)&&index>=0):[];
  }catch{return []}
};

export const toggleArtsCenterFavorite=(favorites:readonly number[],index:number)=>
  favorites.includes(index)?favorites.filter(savedIndex=>savedIndex!==index):[...favorites,index];
