export const YOUTUBE_EMBED_ORIGINS=[
  'https://www.youtube-nocookie.com',
  'https://www.youtube.com',
] as const;

// YouTube can move the embedded player between its privacy-enhanced and
// standard origins. The message contains playback commands only, and the
// receiving window is still the specific iframe's contentWindow.
export const YOUTUBE_POST_MESSAGE_TARGET='*' as const;

export function isYoutubeEmbedOrigin(origin:string){
  return YOUTUBE_EMBED_ORIGINS.some(candidate=>candidate===origin);
}
