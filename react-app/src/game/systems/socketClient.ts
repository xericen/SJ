import { io,Socket } from 'socket.io-client';import type { ClientToServerEvents,ServerToClientEvents } from '../../../shared/socket-events';import { SOCKET_URL } from '../../config/api';
const isWizRuntime=typeof window!=='undefined'&&window.location.hostname.endsWith('.wizide.com');
export const socket:Socket<ServerToClientEvents,ClientToServerEvents>=io(SOCKET_URL,{autoConnect:false,withCredentials:true,...(isWizRuntime?{transports:['polling' as const]}:{})});
