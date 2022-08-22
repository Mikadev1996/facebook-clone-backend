function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401).json({error: "JWT Auth error"});
    req.token = token.replaceAll('"', '');
    next();
}

module.exports = authenticateToken;