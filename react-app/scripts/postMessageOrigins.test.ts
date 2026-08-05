import assert from 'node:assert/strict';
import test from 'node:test';
import { isYoutubeEmbedOrigin,YOUTUBE_POST_MESSAGE_TARGET } from '../src/services/youtubeMessaging';

test('YouTube 임베드의 두 공식 메시지 origin만 허용한다',()=>{
  assert.equal(isYoutubeEmbedOrigin('https://www.youtube-nocookie.com'),true);
  assert.equal(isYoutubeEmbedOrigin('https://www.youtube.com'),true);
  assert.equal(isYoutubeEmbedOrigin('https://youtube.example.com'),false);
  assert.equal(isYoutubeEmbedOrigin('https://sj.wizide.com'),false);
});

test('리디렉션된 YouTube 프레임에도 명령을 전달할 수 있다',()=>{
  assert.equal(YOUTUBE_POST_MESSAGE_TARGET,'*');
});
