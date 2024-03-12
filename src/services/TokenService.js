const jwt = require("jsonwebtoken");

const { accessTokenSecret } = require("../config/config.js");

class Token {
  static verify(req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(403).json({
        data: {
          tokenAuth: {
            access: false,
          },
        },
        message: "A token is required for authentication.",
      });
    }
    jwt.verify(token, accessTokenSecret, (err, decoded) => {
      if (err) {
        res.status(403).json({
          data: {
            tokenAuth: { access: false },
          },
          message: "Failed to verify token",
        });
        return;
      } else {
        req.user = decoded;
        next();
        //res.json({ tokenAuth: { access: true } });
      }
    });
  }
}

module.exports = { Token };
