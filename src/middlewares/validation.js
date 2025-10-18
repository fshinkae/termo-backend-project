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

