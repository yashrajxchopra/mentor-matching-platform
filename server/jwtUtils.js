const jwt = require('jsonwebtoken');
require("dotenv").config();

const TOKEN_KEY = process.env.TOKEN_KEY;
// Generate JWT token
function generateToken(user) {
    const token=  jwt.sign({ userId: user.id, email: user.email }, TOKEN_KEY, { expiresIn: '7d' }); 
    return token;
}

// Verify JWT token
function verifyToken(token) {
    return jwt.verify(token, TOKEN_KEY); 
}

function tokenDecoder(token){
    return jwt.decode(token, TOKEN_KEY); 
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, TOKEN_KEY, (err, user) => { 
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }
        req.user = user; // Attach the decoded user data to the request object
        next();
    });
}

function validateString(input) {
    const regex = /^[a-zA-Z0-9\s,]+$/;
    return regex.test(input);
  }

module.exports = { generateToken, verifyToken, tokenDecoder, authenticateToken, validateString };
