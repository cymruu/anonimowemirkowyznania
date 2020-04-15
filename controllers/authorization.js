var jwt = require('jsonwebtoken');
var config = require('../config.js');
var userModel = require('../models/user.js');
module.exports = function (loginRequired) {
  if (typeof loginRequired === 'undefined') loginRequired = false;
  return function (req, res, next) {
    var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
          if (loginRequired) return res.render('./admin/login.pug', { user: {}, error: 'Sesja wygasła' });
          return next();
        } else {
          userModel.findById(decoded._id, { _id: 1, username: 1, flags: 1 }, (err, user) => {
            if (!err && user) req.user = user;
            return next();
          });
        }
      });
    } else if (loginRequired) {
      return res.render('./admin/login.pug', { user: {} });
    } else {
      return next();
    }
  }
}
