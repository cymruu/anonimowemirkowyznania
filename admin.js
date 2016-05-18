var express = require('express');
var jwt = require('jsonwebtoken');
var adminRouter = express.Router();
var mongoose = require('mongoose');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');
var userModel = require('./models/user.js');
//authoriztion
adminRouter.get('/login', (req, res)=>{
  res.render('./admin/login.jade', {user: {}});
});
adminRouter.post('/login', (req, res)=>{
  userModel.findOne({
    username: req.body.username
  }, (err, user)=>{
    if(err) throw err;

    if(!user){
      res.json({success:false, response:{message: 'user not found'}});
      return;
    }
    if(user.password == req.body.password){
      //success login
      var token = jwt.sign(user, config.secret, {expiresIn: 1440*60});
      res.cookie('token', token);
      res.redirect('/admin/confessions');
    }else{
      res.json({success:false, response:{message: 'wrong password'}});
      return;
    }
  });
});
adminRouter.get('/logout', (req, res)=>{
  res.clearCookie('token');
  res.json({success:true, response:{message: 'logged out successfully'}});
});
adminRouter.use((req, res, next)=>{
  var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
  if (err){
      return res.json({ success: false, message: 'Failed to authenticate token. Please login again' });
    }else{
      req.decoded = decoded;
      if(req.decoded._doc.authorized){
        next();
      }else{
        return res.status(403).send({
          success: false,
          response: {message: 'You\'re not authorized. Please login'}
        });
      }
    }
  });
  }else{
    return res.status(403).send({
      success: false,
      response: {message: 'No token provided.'}
    });
  }
  });
adminRouter.get('/', (req, res)=>{
  res.json({success:true, response:{message:'authorized'}});
});
adminRouter.get('/details/:confession_id', (req, res)=>{
  confessionModel.findById(req.params.confession_id).populate({path:'actions',options:{sort: {_id: -1}}, populate: {path: 'user', select: 'username'}}).exec((err, confession)=>{
    if(err) return res.send(err);
    res.render('./admin/details.jade', {user: req.decoded._doc, confession});
  });
});
adminRouter.get('/confessions', (req, res)=>{
  confessionModel.find().sort({_id: -1}).limit(100).exec((err, confessions)=>{
    if(err) res.send(err);
    res.render('./admin/confessions.jade', {user: req.decoded._doc, confessions: confessions});
  });
});
adminRouter.get('/replies', (req, res)=>{
  replyModel.find().populate('parentID').sort({_id: -1}).limit(100).exec((err, replies)=>{
    if(err) res.send(err);
    res.render('./admin/replies.jade', {user:req.decoded._doc, replies: replies});
  });
});
module.exports = adminRouter;
