const jwt = require('jsonwebtoken');

const jwtSecret = process.env.ADMIN_JWT_SECRET;

const adminAuth = async (req, res, next) => {
    try {
        //x-access-token from headers
        const token = req.header('x-access-token');
        const decodedToken = jwt.verify(token, jwtSecret);
        const user = decodedToken;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}

module.exports = adminAuth;
