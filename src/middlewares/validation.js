export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      error: 'Unavailable Field',
      message: 'Name is required' 
    });
  }

  if (!email || email.trim() === '') {
    return res.status(400).json({ 
      error: 'Unavailable Field',
      message: 'Email is required' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Unavailable Field',
      message: 'Invalid email format' 
    });
  }

  if (!password || password.trim() === '') {
    return res.status(400).json({ 
      error: 'Unavailable Field',
      message: 'Password is required' 
    });
  }

  if (password.length < 4) {
    return res.status(400).json({ 
      error: 'Unavailable Field',
      message: 'Password must be at least 4 characters long' 
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'Email is required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'Invalid email format'
    });
  }

  if (!password || password.trim() === '') {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'Password is required'
    });
  }

  next();
};

export const validateGameFinish = (req, res, next) => {
  const { score, win, lose, tries, keyword } = req.body;
  const callerID = req.headers['x-caller-id'];
  const tigerToken = req.headers['x-tiger-token'];

  if (!callerID) {
    return res.status(400).json({
      error: 'Unavailable Fields',
      message: 'x-caller-id is required'
    });
  }

  if (!tigerToken) {
    return res.status(400).json({
      error: 'Unavailable Fields',
      message: 'x-tiger-token field is required'
    });
  }

  if (score === undefined) {
    return res.status(400).json({
      error: 'Unavailable Fields',
      message: 'Score field is required'
    });
  }

  if (typeof win !== 'boolean' || typeof lose !== 'boolean') {
    return res.status(400).json({
      error: 'Invalid Fields',
      message: 'Win and Lose fields must be boolean'
    });
  }

  if (win === lose) {
    return res.status(400).json({
      error: 'Invalid Combination',
      message: 'Either win or lose must be true, but not both'
    });
  }

  // Validações opcionais
  if (tries !== undefined && (typeof tries !== 'number' || tries < 0)) {
    return res.status(400).json({
      error: 'Invalid Fields',
      message: 'Tries must be a non-negative number'
    });
  }

  if (keyword !== undefined && (typeof keyword !== 'string' || keyword.trim() === '')) {
    return res.status(400).json({
      error: 'Invalid Fields',
      message: 'Keyword must be a non-empty string'
    });
  }

  next();
};

export const validateFriendRequest = (req, res, next) => {
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'friendId is required'
    });
  }

  if (typeof friendId !== 'number' && isNaN(parseInt(friendId))) {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'friendId must be a valid number'
    });
  }

  next();
};

export const validateFriendId = (req, res, next) => {
  const { friendId } = req.params;

  if (!friendId) {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'friendId is required'
    });
  }

  if (isNaN(parseInt(friendId))) {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'friendId must be a valid number'
    });
  }

  next();
};

export const validateCallerId = (req, res, next) => {
  const callerId = req.headers['x-caller-id'];

  if (!callerId) {
    return res.status(400).json({
      error: 'Unavailable Field',
      message: 'x-caller-id header is required'
    });
  }

  next();
};
