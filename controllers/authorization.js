var jwt = require('jsonwebtoken');
var config = require('../config.js');
module.exports = function(req, res, next){
    var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, config.secret, function(err, decoded) {
    if (err){
        return res.render('./admin/login.jade', {user: {}, error: 'Sesja wygasła'});
      }else{
        req.decoded = decoded;
        next();
      }
    });
    }else{
        return res.render('./admin/login.jade', {user: {}});
    }
}
