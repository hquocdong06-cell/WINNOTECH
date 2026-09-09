const { Server } = require("socket.io");
const mongoose = require("mongoose");

let io = null;

/**
 * Khởi tạo Socket.io Server gắn với HTTP Server của Express
 * @param {import('http').Server} httpServer 
 * @param {string[]} allowedOrigins 
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer, allowedOrigins = []) {
  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          /^http:\/\/localhost:(517[0-9])$/.test(origin) ||
          (origin && origin.includes("winnotech.io.vn"))
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    // Client tham gia phòng theo ID của người dùng
    socket.on("join", (data) => {
      try {
        if (data?.userId) {
          const userRoom = `user_${data.userId.toString()}`;
          socket.join(userRoom);
        }
        if (data?.role === "admin" || data?.isAdmin) {
          socket.join("admin");
        }
      } catch (e) {
        console.error("Lỗi join socket room:", e);
      }
    });

    socket.on("join:admin", () => {
      socket.join("admin");
    });
  });

  return io;
}

/**
 * Lấy instance socket.io
 * @returns {import('socket.io').Server | null}
 */
function getIo() {
  return io;
}

/**
 * Phát sự kiện cập nhật đơn hàng đến User và Admin theo thời gian thực
 * @param {string|object} orderOrId Đơn hàng hoặc ID đơn hàng
 * @param {string} action Loại hành động (vd: 'status_updated', 'payment_status_updated', ...)
 * @param {object} extra Dữ liệu phụ nếu có
 */
async function emitOrderUpdate(orderOrId, action = "updated", extra = {}) {
  try {
    if (!io) return;
    const { Order, OrderItem } = require("../models/Order");

    let order = orderOrId;
    let orderId = "";

    if (typeof orderOrId === "string" || (orderOrId && mongoose.Types.ObjectId.isValid(orderOrId) && !orderOrId.status)) {
      orderId = orderOrId.toString();
      order = await Order.findById(orderId).populate("payment_method").lean();
    } else if (order && order.toObject) {
      orderId = (order._id || "").toString();
      order = order.toObject();
    } else if (order && order._id) {
      orderId = order._id.toString();
    }

    if (!order) return;

    const rawUserId = order.user_id?._id || order.user_id;
    const userId = rawUserId ? rawUserId.toString() : "";

    // Lấy items của đơn hàng nếu chưa có sẵn
    let orderItems = order.items;
    if (!orderItems || !orderItems.length) {
      try {
        orderItems = await OrderItem.find({ order_id: order._id })
          .populate("variants_id")
          .lean();
      } catch (err) {
        orderItems = [];
      }
    }

    const payload = {
      action,
      orderId,
      code: order.code,
      userId,
      status: order.status,
      payment_status: order.payment_status,
      tracking_code: order.tracking_code || "",
      shipping_carrier: order.shipping_carrier || "",
      estimated_delivery: order.estimated_delivery || null,
      statusHistory: order.statusHistory || [],
      return_request: order.return_request || null,
      refund_info: order.refund_info || null,
      cancel_reason: order.cancel_reason || "",
      total_amount: order.total_amount || 0,
      updatedAt: order.updatedAt || new Date().toISOString(),
      order: {
        ...order,
        items: orderItems || []
      },
      ...extra
    };

    // 1. Phát trực tiếp vào phòng riêng của User
    if (userId) {
      io.to(`user_${userId}`).emit("order:updated", payload);
    }

    // 2. Phát vào phòng Admin
    io.to("admin").emit("order:updated", payload);

    // 3. Broadcast fallback cho tất cả client
    io.emit("order:change", {
      orderId,
      userId,
      code: order.code,
      status: order.status,
      payment_status: order.payment_status,
      action
    });
  } catch (err) {
    console.error("Lỗi trong emitOrderUpdate (Socket):", err);
  }
}

module.exports = {
  initSocket,
  getIo,
  emitOrderUpdate
};
