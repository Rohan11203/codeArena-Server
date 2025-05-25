import jwt from 'jsonwebtoken';

export function userAuth(req, res, next) {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If JWT present, verify and attach userId
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_USER_SECRET);
      req.userId = payload.userId || payload.id;
      return next();
    }

    // Fallback to Passport session (Google OAuth)
    if (req.user && req.user._id) {
      req.userId = req.user._id.toString();
      return next();
    }

    return res.status(401).json({ message: 'Unauthenticated: No valid token or session.' });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
}
