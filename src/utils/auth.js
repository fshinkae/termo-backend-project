import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
    const token = req.headers['x-tiger-token'];
    if (!token) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Token is missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.userId = decoded.id; 
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
    }
};
