export type FoodTruckId='local'|'street'|'dessert';
export type FoodItemType='restaurant'|'local_food'|'cafe';

export const kakaoMapSearchUrl=(name:string,address:string)=>
  `https://map.kakao.com/link/search/${encodeURIComponent(`${name} ${address}`.trim())}`;

export const foodImageUrl=(url:string,baseUrl:string)=>{
  if(!url.startsWith('/images/'))return url;
  return `${baseUrl.replace(/\/?$/,'/')}${url.slice(1)}`;
};

export type SejongFoodPlace={
  id:string;truckId:FoodTruckId;itemType:FoodItemType;name:string;menuName:string;
  category:string[];tags:string[];district:string;address:string;priceRange:string;
  openingHours:string;closedDays:string;description:string;features:string[];
  nearbyPlaces:string[];imageUrl:string;imageSource:string;mapUrl:string;
  origin?:string;season?:string;purchasePlaces?:string[];festival?:string;
  atmosphereTags?:string[];localIngredient?:string;photoZone?:boolean;
  infoSections?:Array<{id:string;title:string;content:string}>;
  sourceUrl:string;sourceLabel:string;verifiedAt:string;active:boolean;
};
