const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user type from token. Default to 'profissional' if not present for backward compatibility.
    const userType = decoded.tipo || 'profissional'; 
    let user = null;

    if (userType === 'cliente') {
      user = await prisma.cliente.findUnique({
        where: { id: decoded.id },
      });
      req.cliente = user;
    } else if (userType === 'profissional') {
      user = await prisma.profissional.findUnique({
        where: { id: decoded.id },
      });
      req.profissional = user;
    } else {
        // If the token has an unknown type
        return res.status(401).json({ message: 'Invalid token: Unknown user type.' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: User not found.' });
    }

    // Attach generic user and userType to request for easier access in next middleware/routes
    req.user = user;
    req.userType = userType;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;

