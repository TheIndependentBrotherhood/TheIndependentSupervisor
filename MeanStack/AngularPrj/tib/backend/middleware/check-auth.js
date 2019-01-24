const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, 'le_secret_devrait_être_plus_long');
  } catch (error) {
    res.status(401).json({
      message: 'Auth failed!'
    });
  }

};
