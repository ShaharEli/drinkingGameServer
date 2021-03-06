const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const { getSocketsList } = require("../utils/socket.util");
const { verifyAccessToken } = require("../utils/tokens.util");
const socketHandler = (io) => {
  io.use(async (socket, next) => {
    const isAuthenticated = verifyAccessToken(socket.handshake.auth?.token);
    const userId = isAuthenticated.userId?.userId;
    if (isAuthenticated && userId) {
      const { firebaseToken = null } = socket.handshake.auth;
      socket["userId"] = userId;
      socket["firebaseToken"] = firebaseToken;
      return next();
    }
    next(new Error("not authorized"));
  });

  io.on("connection", async (socket) => {
    try {
      await User.findOneAndUpdate(
        { _id: socket.userId },
        {
          isActive: true,
          socketId: socket.id,
          firebaseToken: socket.firebaseToken,
        }
      );
      io.emit("socketConnected", { user: socket.userId });
    } catch ({ message }) {
      Logger.error(message);
    }

    socket.on("disconnect", async () => {
      try {
        const lastConnected = new Date();
        await User.findOneAndUpdate(
          { _id: socket.userId },
          { isActive: false, lastConnected }
        );
        io.emit("socketDisconnected", {
          user: socket.userId,
          lastConnected,
        });
      } catch ({ message }) {
        Logger.error(message);
      }
    });

    socket.on("leftChat", async ({ chatId }) => {
      if (!chatId) return; //TODO error response
      socket.leave(chatId);
    });

    socket.on("joinedChat", async ({ chatId, participants }) => {
      if (!chatId) return; //TODO error response
      socket.join(chatId);
      await seen(chatId, socket, participants);
    });

    socket.on("seen", async ({ chatId, participants }) => {
      if (!chatId) return; //TODO error response
      await seen(chatId, socket, participants);
    });
  });
};

const seen = async (chatId, socket, participants) => {
  try {
    // await Message.updateMany(
    //   { chatId },
    //   { $addToSet: { seenBy: socket.userId } }
    // );
    socket.to(participants).emit("seen", { userId: socket.userId, chatId });
  } catch (e) {
    Logger.error(e);
  }
};

module.exports = socketHandler;
