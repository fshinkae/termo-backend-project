import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import Keyword from '../models/Keyword.js';

class SocketManager {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map();
    this.gameInvites = new Map();
    this.gameRooms = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('Socket auth: Token não fornecido');
        return next(new Error('Token não fornecido'));
      }

      const decoded = verifyToken(token);
      
      if (!decoded) {
        console.log('Socket auth: Token inválido ou expirado', { tokenLength: token.length });
        return next(new Error('Token inválido'));
      }

      socket.userId = decoded.userId;
      socket.userData = {
        id: decoded.userId,
        email: decoded.email
      };
      console.log(`Socket auth: Usuário autenticado - ${decoded.userId}`);
      next();
    });

    this.io.on('connection', (socket) => {
      console.log(`Usuário conectado: ${socket.userId}`);

      this.handleConnection(socket);
      
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      socket.on('user:setOnline', () => {
        this.handleSetOnline(socket);
      });

      socket.on('friends:getOnline', () => {
        this.handleGetOnlineFriends(socket);
      });

      socket.on('game:invite', (data) => {
        this.handleGameInvite(socket, data);
      });

      socket.on('game:acceptInvite', (data) => {
        this.handleAcceptInvite(socket, data);
      });

      socket.on('game:rejectInvite', (data) => {
        this.handleRejectInvite(socket, data);
      });

      socket.on('game:ready', (data) => {
        this.handleGameReady(socket, data);
      });

      socket.on('game:guess', (data) => {
        this.handleGameGuess(socket, data);
      });

      socket.on('game:leave', (data) => {
        this.handleGameLeave(socket, data);
      });
    });
  }

  handleConnection(socket) {
    const user = User.findById(socket.userId);
    if (user) {
      this.onlineUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar
      });

      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar
      });
    }
  }

  handleDisconnection(socket) {
    const userData = this.onlineUsers.get(socket.userId);
    if (userData) {
      this.onlineUsers.delete(socket.userId);

      socket.broadcast.emit('user:offline', {
        userId: socket.userId
      });

      const room = this.gameRooms.get(socket.userId);
      if (room) {
        const opponentId = room.player1Id === socket.userId ? room.player2Id : room.player1Id;
        if (opponentId) {
          const opponentSocket = this.getSocketByUserId(opponentId);
          if (opponentSocket) {
            opponentSocket.emit('game:opponentLeft');
          }
          this.gameRooms.delete(socket.userId);
          this.gameRooms.delete(opponentId);
        }
      }

      const invites = Array.from(this.gameInvites.values()).filter(
        invite => invite.fromId === socket.userId || invite.toId === socket.userId
      );
      invites.forEach(invite => {
        this.gameInvites.delete(invite.id);
      });
    }
  }

  handleSetOnline(socket) {
    const user = User.findById(socket.userId);
    if (user && !this.onlineUsers.has(socket.userId)) {
      this.onlineUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar
      });

      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar
      });
    }

    socket.emit('user:onlineStatus', {
      online: true
    });
  }

  handleGetOnlineFriends(socket) {
    const friends = Friendship.getFriends(socket.userId);
    const onlineFriends = friends
      .filter(friend => this.onlineUsers.has(friend.User_Id))
      .map(friend => {
        const onlineUser = this.onlineUsers.get(friend.User_Id);
        return {
          id: friend.User_Id,
          nickname: friend.Nickname,
          email: friend.Email,
          avatar: friend.Avatar,
          online: true
        };
      });

    socket.emit('friends:onlineList', {
      friends: onlineFriends
    });
  }

  handleGameInvite(socket, data) {
    const { toId } = data;

    if (!toId) {
      return socket.emit('game:error', {
        message: 'ID do amigo não fornecido'
      });
    }

    const toUser = User.findById(toId);
    if (!toUser) {
      return socket.emit('game:error', {
        message: 'Usuário não encontrado'
      });
    }

    const areFriends = Friendship.areFriends(socket.userId, toId);
    if (!areFriends) {
      return socket.emit('game:error', {
        message: 'Você só pode convidar amigos'
      });
    }

    const toUserOnline = this.onlineUsers.get(toId);
    if (!toUserOnline) {
      return socket.emit('game:error', {
        message: 'Usuário não está online'
      });
    }

    const inviteId = `${socket.userId}-${toId}-${Date.now()}`;
    const invite = {
      id: inviteId,
      fromId: socket.userId,
      toId: toId,
      fromNickname: User.findById(socket.userId)?.Nickname,
      fromAvatar: User.findById(socket.userId)?.Avatar,
      createdAt: new Date()
    };

    this.gameInvites.set(inviteId, invite);

    const toSocket = this.getSocketByUserId(toId);
    if (toSocket) {
      toSocket.emit('game:inviteReceived', {
        invite: {
          id: invite.id,
          fromId: invite.fromId,
          fromNickname: invite.fromNickname,
          fromAvatar: invite.fromAvatar,
          createdAt: invite.createdAt
        }
      });
    }

    socket.emit('game:inviteSent', {
      invite: {
        id: invite.id,
        toId: invite.toId,
        toNickname: toUser.Nickname,
        createdAt: invite.createdAt
      }
    });

    setTimeout(() => {
      if (this.gameInvites.has(inviteId)) {
        this.gameInvites.delete(inviteId);
        socket.emit('game:inviteExpired', { inviteId });
        if (toSocket) {
          toSocket.emit('game:inviteExpired', { inviteId });
        }
      }
    }, 60000);
  }

  handleAcceptInvite(socket, data) {
    const { inviteId } = data;

    const invite = this.gameInvites.get(inviteId);
    if (!invite) {
      return socket.emit('game:error', {
        message: 'Convite não encontrado ou expirado'
      });
    }

    if (invite.toId !== socket.userId) {
      return socket.emit('game:error', {
        message: 'Este convite não é para você'
      });
    }

    const fromSocket = this.getSocketByUserId(invite.fromId);
    if (!fromSocket) {
      return socket.emit('game:error', {
        message: 'Usuário que enviou o convite não está mais online'
      });
    }

    this.gameInvites.delete(inviteId);

    const roomId = `room-${invite.fromId}-${invite.toId}-${Date.now()}`;
    const room = {
      id: roomId,
      player1Id: invite.fromId,
      player2Id: invite.toId,
      player1Ready: false,
      player2Ready: false,
      player1Score: 0,
      player2Score: 0,
      keyword: null,
      keywordId: null,
      gameStarted: false,
      gameEnded: false,
      createdAt: new Date()
    };

    this.gameRooms.set(invite.fromId, room);
    this.gameRooms.set(invite.toId, room);

    socket.join(roomId);
    fromSocket.join(roomId);

    socket.emit('game:inviteAccepted', {
      roomId,
      opponent: {
        id: invite.fromId,
        nickname: invite.fromNickname,
        avatar: invite.fromAvatar
      }
    });

    fromSocket.emit('game:inviteAccepted', {
      roomId,
      opponent: {
        id: invite.toId,
        nickname: User.findById(invite.toId)?.Nickname,
        avatar: User.findById(invite.toId)?.Avatar
      }
    });
  }

  handleRejectInvite(socket, data) {
    const { inviteId } = data;

    const invite = this.gameInvites.get(inviteId);
    if (!invite) {
      return socket.emit('game:error', {
        message: 'Convite não encontrado'
      });
    }

    if (invite.toId !== socket.userId) {
      return socket.emit('game:error', {
        message: 'Este convite não é para você'
      });
    }

    this.gameInvites.delete(inviteId);

    const fromSocket = this.getSocketByUserId(invite.fromId);
    if (fromSocket) {
      fromSocket.emit('game:inviteRejected', {
        inviteId,
        fromId: socket.userId
      });
    }

    socket.emit('game:inviteRejected', {
      inviteId
    });
  }

  handleGameReady(socket, data) {
    const { roomId } = data;

    const room = this.gameRooms.get(socket.userId);
    if (!room || room.id !== roomId) {
      return socket.emit('game:error', {
        message: 'Sala não encontrada'
      });
    }

    if (room.player1Id === socket.userId) {
      room.player1Ready = true;
    } else if (room.player2Id === socket.userId) {
      room.player2Ready = true;
    }

    const opponentId = room.player1Id === socket.userId ? room.player2Id : room.player1Id;
    const opponentSocket = this.getSocketByUserId(opponentId);
    if (opponentSocket) {
      opponentSocket.emit('game:opponentReady', {
        roomId
      });
    }

    if (room.player1Ready && room.player2Ready && !room.gameStarted) {
      setTimeout(() => {
        try {
          const randomKeyword = Keyword.getRandom();
          
          if (randomKeyword && randomKeyword.Keyword) {
            room.keyword = randomKeyword.Keyword.toUpperCase();
            room.keywordId = randomKeyword.Keyword_ID;
            room.gameStarted = true;

            socket.emit('game:start', {
              roomId,
              keyword: room.keyword,
              keywordId: room.keywordId
            });

            if (opponentSocket) {
              opponentSocket.emit('game:start', {
                roomId,
                keyword: room.keyword,
                keywordId: room.keywordId
              });
            }
          }
        } catch (error) {
          console.error('Erro ao iniciar jogo:', error);
          socket.emit('game:error', {
            message: 'Erro ao iniciar jogo'
          });
        }
      }, 1000);
    }
  }

  handleGameGuess(socket, data) {
    const { roomId, guess } = data;

    const room = this.gameRooms.get(socket.userId);
    if (!room || room.id !== roomId || !room.gameStarted) {
      return socket.emit('game:error', {
        message: 'Jogo não encontrado ou não iniciado'
      });
    }

    const opponentId = room.player1Id === socket.userId ? room.player2Id : room.player1Id;
    const opponentSocket = this.getSocketByUserId(opponentId);

    if (guess.toUpperCase() === room.keyword.toUpperCase()) {
      if (room.player1Id === socket.userId) {
        room.player1Score += 1;
      } else {
        room.player2Score += 1;
      }

      socket.emit('game:guessResult', {
        correct: true,
        score: room.player1Id === socket.userId ? room.player1Score : room.player2Score,
        opponentScore: room.player1Id === socket.userId ? room.player2Score : room.player1Score
      });

      if (opponentSocket) {
        opponentSocket.emit('game:opponentGuessResult', {
          opponentScore: room.player1Id === socket.userId ? room.player1Score : room.player2Score,
          yourScore: room.player1Id === socket.userId ? room.player2Score : room.player1Score
        });
      }

      setTimeout(() => {
        try {
          const randomKeyword = Keyword.getRandom();
          if (randomKeyword && randomKeyword.Keyword) {
            room.keyword = randomKeyword.Keyword.toUpperCase();
            room.keywordId = randomKeyword.Keyword_ID;

            socket.emit('game:newKeyword', {
              keyword: room.keyword,
              keywordId: room.keywordId
            });

            if (opponentSocket) {
              opponentSocket.emit('game:newKeyword', {
                keyword: room.keyword,
                keywordId: room.keywordId
              });
            }
          }
        } catch (error) {
          console.error('Erro ao gerar nova palavra:', error);
        }
      }, 1000);
    } else {
      socket.emit('game:guessResult', {
        correct: false,
        guess
      });
    }
  }

  handleGameLeave(socket, data) {
    const { roomId } = data;

    const room = this.gameRooms.get(socket.userId);
    if (room) {
      const opponentId = room.player1Id === socket.userId ? room.player2Id : room.player1Id;
      const opponentSocket = this.getSocketByUserId(opponentId);

      if (opponentSocket) {
        opponentSocket.emit('game:opponentLeft');
      }

      this.gameRooms.delete(socket.userId);
      if (opponentId) {
        this.gameRooms.delete(opponentId);
      }

      socket.leave(roomId);
      socket.emit('game:left', {
        roomId
      });
    }
  }

  getSocketByUserId(userId) {
    const userData = this.onlineUsers.get(userId);
    if (!userData) return null;
    return this.io.sockets.sockets.get(userData.socketId);
  }
}

const socketManager = new SocketManager();

export default socketManager;

