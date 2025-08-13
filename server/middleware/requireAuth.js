// middleware/requireAuth.js
module.exports = function requireAuth(req, res, next) {
  // Example: decode JWT from Authorization: Bearer <token>
  // Attach user id to req.user.id. Replace with your real auth.
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  try {
    // const payload = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = { id: payload.sub };
    // Mock (replace above with your real logic):
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    req.user = { id: "user_123" };
    next();
  } catch (_) {
    res.status(401).json({ error: "Unauthorized" });
  }
};