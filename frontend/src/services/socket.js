import { io } from 'socket.io-client';
import { API_BASE } from './apiService';

let socket = null;

/**
 * Lấy hoặc khởi tạo Socket client singleton
 * @returns {import('socket.io-client').Socket}
 */
export function getSocket() {
  if (!socket) {
    socket = io(API_BASE, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket] Đã kết nối Socket.IO thành công, socket ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [Socket] Đã ngắt kết nối Socket.IO:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚡ [Socket] Kết nối lỗi:', error.message);
    });
  }

  // Nếu socket bị ngắt kết nối chủ động thì connect lại
  if (socket && !socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Gửi yêu cầu tham gia room của User hoặc Admin
 * @param {string} userId ID của người dùng
 * @param {string} role Vai trò (vd: 'admin' hoặc 'member')
 */
export function joinUserRoom(userId, role = 'member') {
  const s = getSocket();
  if (s && userId) {
    const emitJoin = () => {
      s.emit('join', { userId: userId.toString(), role });
      if (role === 'admin') {
        s.emit('join:admin');
      }
    };

    if (s.connected) {
      emitJoin();
    } else {
      s.once('connect', emitJoin);
    }
  }
}

/**
 * Đóng kết nối socket khi người dùng đăng xuất
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
