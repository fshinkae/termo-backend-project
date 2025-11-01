import Friendship from '../models/Friendship.js';
import User from '../models/User.js';

export const addFriend = (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    if (userId === parseInt(friendId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot add yourself as friend'
      });
    }

    const friend = User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (Friendship.isBlocked(friendId, userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cannot send friend request to this user'
      });
    }

    if (Friendship.exists(userId, friendId)) {
      const status = Friendship.getStatus(userId, friendId);
      return res.status(409).json({
        error: 'Conflict',
        message: `Friend request already ${status}`
      });
    }

    if (Friendship.exists(friendId, userId)) {
      const status = Friendship.getStatus(friendId, userId);
      if (status === 'pending') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'This user already sent you a friend request'
        });
      }
    }

    const friendshipId = Friendship.add(userId, friendId);

    return res.status(200).json({
      message: 'Friend request sent successfully',
      friendship: {
        id: friendshipId,
        userId,
        friendId: parseInt(friendId),
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Add friend error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while adding friend'
    });
  }
};

export const acceptFriend = (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    const friend = User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (!Friendship.exists(friendId, userId)) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Friend request not found'
      });
    }

    const status = Friendship.getStatus(friendId, userId);
    if (status !== 'pending') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Friend request is already ${status}`
      });
    }

    const success = Friendship.accept(userId, friendId);

    if (!success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to accept friend request'
      });
    }

    return res.status(200).json({
      message: 'Friend request accepted',
      friend: {
        id: friend.User_Id,
        nickname: friend.Nickname,
        email: friend.Email,
        avatar: friend.Avatar
      }
    });
  } catch (error) {
    console.error('Accept friend error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while accepting friend request'
    });
  }
};

export const removeFriend = (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    const friend = User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (!Friendship.exists(userId, friendId) && !Friendship.exists(friendId, userId)) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Friendship not found'
      });
    }

    const success = Friendship.remove(userId, friendId);

    if (!success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to remove friendship'
      });
    }

    return res.status(200).json({
      message: 'Friendship removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while removing friend'
    });
  }
};

export const blockUser = (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    if (userId === parseInt(friendId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot block yourself'
      });
    }

    const friend = User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const success = Friendship.block(userId, friendId);

    if (!success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to block user'
      });
    }

    return res.status(200).json({
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while blocking user'
    });
  }
};

export const getFriends = (req, res) => {
  try {
    const userId = req.userId;
    const friends = Friendship.getFriends(userId);

    return res.status(200).json({
      message: 'Friends retrieved successfully',
      count: friends.length,
      friends: friends.map(friend => ({
        id: friend.User_Id,
        nickname: friend.Nickname,
        email: friend.Email,
        avatar: friend.Avatar,
        friendsSince: friend.Created_At
      }))
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving friends'
    });
  }
};

export const getPendingRequests = (req, res) => {
  try {
    const userId = req.userId;
    const requests = Friendship.getPendingRequests(userId);

    return res.status(200).json({
      message: 'Pending requests retrieved successfully',
      count: requests.length,
      requests: requests.map(request => ({
        id: request.User_Id,
        nickname: request.Nickname,
        email: request.Email,
        avatar: request.Avatar,
        requestedAt: request.Created_At
      }))
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving pending requests'
    });
  }
};

export const getSentRequests = (req, res) => {
  try {
    const userId = req.userId;
    const requests = Friendship.getSentRequests(userId);

    return res.status(200).json({
      message: 'Sent requests retrieved successfully',
      count: requests.length,
      requests: requests.map(request => ({
        id: request.User_Id,
        nickname: request.Nickname,
        email: request.Email,
        avatar: request.Avatar,
        sentAt: request.Created_At
      }))
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving sent requests'
    });
  }
};

export const getBlocked = (req, res) => {
  try {
    const userId = req.userId;
    const blocked = Friendship.getBlocked(userId);

    return res.status(200).json({
      message: 'Blocked users retrieved successfully',
      count: blocked.length,
      blocked: blocked.map(user => ({
        id: user.User_Id,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar
      }))
    });
  } catch (error) {
    console.error('Get blocked error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving blocked users'
    });
  }
};

