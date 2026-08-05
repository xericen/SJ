import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { io, type Socket } from 'socket.io-client';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(appRoot, 'server', '.env'), override: false, quiet: true });

const reservePort = () => new Promise<number>((resolve, reject) => {
  const probe = createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    probe.close((error) => error ? reject(error) : resolve(port));
  });
});

const waitForReady = async (url: string, process: ChildProcess) => {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`Node server exited with ${process.exitCode}`);
    try {
      const response = await fetch(`${url}/health/ready`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Node server readiness timed out.');
};

const waitForEvent = <T>(
  socket: Socket,
  event: string,
  predicate: (value: T) => boolean = () => true,
) => new Promise<T>((resolve, reject) => {
  const timer = setTimeout(() => {
    socket.off(event, handler);
    reject(new Error(`${event} event timed out`));
  }, 5_000);
  const handler = (value: T) => {
    if (!predicate(value)) return;
    clearTimeout(timer);
    socket.off(event, handler);
    resolve(value);
  };
  socket.on(event, handler);
});

const connect = (url: string) => new Promise<Socket>((resolve, reject) => {
  const socket = io(url, { transports: ['websocket'], forceNew: true, reconnection: false });
  const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 5_000);
  socket.once('connect', () => {
    clearTimeout(timer);
    resolve(socket);
  });
  socket.once('connect_error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
});

const appearance = {
  hair: '#2f241f', face: '#f2c8a0', top: '#2f8f72', bottom: '#28485d', shoes: '#ffffff', accessory: 'none',
};
const profile = {
  mbti: 'ENFP', interests: ['산책'], usagePurposes: ['이웃 교류'],
  preferredPlaceCategories: ['공원'], experienceRecords: [], recordVisibility: 'public' as const, chatEnabled: true,
};
const joinPayload = (nickname: string, x: number) => ({
  mapId: 'town', nickname, appearance, model: 'custom', x, y: 1180, matchProfile: profile,
});

const runtimeDirectory = await mkdtemp(path.join(os.tmpdir(), 'jochwon-realtime-'));
const port = await reservePort();
const baseUrl = `http://127.0.0.1:${port}`;
const serverEntry = path.join(appRoot, 'server', 'dist', 'server', 'src', 'index.js');
const server = spawn(process.execPath, [serverEntry], {
  cwd: runtimeDirectory,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: String(port),
    CLIENT_ORIGIN: baseUrl,
    RUNTIME_DATA_DIR: runtimeDirectory,
    AI_PROVIDER: 'mock',
    PLACE_PROVIDER: 'mock',
    OPENAI_MOCK_ENABLED: 'true',
    ALLOW_MOCK_FALLBACK: 'true',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let first: Socket | undefined;
let second: Socket | undefined;
try {
  await waitForReady(baseUrl, server);
  [first, second] = await Promise.all([connect(baseUrl), connect(baseUrl)]);

  first.emit('joinMap', joinPayload('검증 사용자 A', 1800));
  await waitForEvent<any[]>(first, 'currentMapUsers', (players) => players.length === 1);

  const joined = waitForEvent<any>(first, 'userJoined', (player) => player.nickname === '검증 사용자 B');
  const secondUsers = waitForEvent<any[]>(second, 'currentMapUsers', (players) => players.length === 2);
  second.emit('joinMap', joinPayload('검증 사용자 B', 1820));
  await Promise.all([joined, secondUsers]);

  const moved = waitForEvent<any>(second, 'userMoved', (player) => player.nickname === '검증 사용자 A' && player.x === 1840);
  first.emit('userMoved', {
    mapId: 'town', x: 1840, y: 1180, direction: 'right', isMoving: true,
    yaw: Math.PI / 2, motionState: 'walk', jumpHeight: 0, timestamp: Date.now(),
  });
  await moved;

  const chat = waitForEvent<any>(second, 'nearbyChat', (message) => message.message === '다중 사용자 검증 메시지');
  first.emit('sendNearbyChat', '다중 사용자 검증 메시지');
  const received = await chat;
  assert.equal(received.nickname, '검증 사용자 A');

  const left = waitForEvent<string>(first, 'userLeft', (id) => id === second?.id);
  second.emit('changeMap', { ...joinPayload('검증 사용자 B', 800), mapId: 'campus' });
  await left;

  console.log('Multiplayer verification passed: two clients, join, movement, nearby chat, and room isolation');
} finally {
  first?.disconnect();
  second?.disconnect();
  server.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    if (server.exitCode !== null) return resolve();
    server.once('exit', () => resolve());
    setTimeout(() => { server.kill('SIGKILL'); resolve(); }, 5_000).unref();
  });
  await rm(runtimeDirectory, { recursive: true, force: true });
}
