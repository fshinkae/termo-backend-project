CREATE TABLE IF NOT EXISTS Status (
  Status_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Points INTEGER DEFAULT 0,
  Wins INTEGER DEFAULT 0,
  Loses INTEGER DEFAULT 0,
  XP INTEGER DEFAULT 0,
  Games INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS History (
  Historic_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Game_IDs TEXT DEFAULT '[]',
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users (
  User_Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Nickname TEXT NOT NULL UNIQUE,
  Email TEXT NOT NULL UNIQUE,
  Password TEXT NOT NULL,
  Status_ID INTEGER,
  Avatar TEXT,
  History_ID INTEGER,
  FOREIGN KEY (Status_ID) REFERENCES Status(Status_ID) ON DELETE SET NULL,
  FOREIGN KEY (History_ID) REFERENCES History(Historic_ID) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Keyword (
  Keyword_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Keyword TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Game (
  Game_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Keyword_ID INTEGER NOT NULL,
  Tries INTEGER DEFAULT 0,
  isWin INTEGER DEFAULT 0,
  XP INTEGER DEFAULT 0,
  Points INTEGER DEFAULT 0,
  FOREIGN KEY (Keyword_ID) REFERENCES Keyword(Keyword_ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Friendships (
  Friendship_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User_ID INTEGER NOT NULL,
  Friend_ID INTEGER NOT NULL,
  Status TEXT DEFAULT 'pending',
  Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
  Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (User_ID) REFERENCES Users(User_Id) ON DELETE CASCADE,
  FOREIGN KEY (Friend_ID) REFERENCES Users(User_Id) ON DELETE CASCADE,
  UNIQUE(User_ID, Friend_ID),
  CHECK(User_ID != Friend_ID)
);

CREATE TABLE IF NOT EXISTS Activity_Log (
  Log_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User_ID INTEGER,
  Action_Type TEXT NOT NULL,
  Old_Value TEXT,
  New_Value TEXT,
  Description TEXT,
  Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (User_ID) REFERENCES Users(User_Id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON Users(Nickname);
CREATE INDEX IF NOT EXISTS idx_users_status ON Users(Status_ID);
CREATE INDEX IF NOT EXISTS idx_users_history ON Users(History_ID);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON Friendships(User_ID);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON Friendships(Friend_ID);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON Friendships(Status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON Activity_Log(User_ID);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON Activity_Log(Action_Type);
CREATE INDEX IF NOT EXISTS idx_game_keyword ON Game(Keyword_ID);

CREATE TRIGGER log_user_insert
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
  INSERT INTO Activity_Log (User_ID, Action_Type, Description)
  VALUES (NEW.User_Id, 'USER_REGISTERED', 'User ' || NEW.Nickname || ' registered');
END;

CREATE TRIGGER log_user_nickname_update
AFTER UPDATE OF Nickname ON Users
FOR EACH ROW
WHEN OLD.Nickname != NEW.Nickname
BEGIN
  INSERT INTO Activity_Log (User_ID, Action_Type, Old_Value, New_Value, Description)
  VALUES (NEW.User_Id, 'NICKNAME_UPDATED', OLD.Nickname, NEW.Nickname,
          'Nickname: ' || OLD.Nickname || ' → ' || NEW.Nickname);
END;

CREATE TRIGGER log_user_email_update
AFTER UPDATE OF Email ON Users
FOR EACH ROW
WHEN OLD.Email != NEW.Email
BEGIN
  INSERT INTO Activity_Log (User_ID, Action_Type, Old_Value, New_Value, Description)
  VALUES (NEW.User_Id, 'EMAIL_UPDATED', OLD.Email, NEW.Email,
          'Email: ' || OLD.Email || ' → ' || NEW.Email);
END;

CREATE TRIGGER log_user_avatar_update
AFTER UPDATE OF Avatar ON Users
FOR EACH ROW
WHEN OLD.Avatar IS NOT NEW.Avatar
BEGIN
  INSERT INTO Activity_Log (User_ID, Action_Type, Description)
  VALUES (NEW.User_Id, 'AVATAR_UPDATED', 'Avatar changed');
END;

CREATE TRIGGER log_user_password_change
AFTER UPDATE OF Password ON Users
FOR EACH ROW
WHEN OLD.Password != NEW.Password
BEGIN
  INSERT INTO Activity_Log (User_ID, Action_Type, Description)
  VALUES (NEW.User_Id, 'PASSWORD_CHANGED', 'Password changed');
END;

CREATE TRIGGER log_user_delete
BEFORE DELETE ON Users
FOR EACH ROW
BEGIN
  INSERT INTO Activity_Log (User_ID, Action_Type, Description)
  VALUES (OLD.User_Id, 'USER_DELETED', 'User ' || OLD.Nickname || ' deleted');
END;

