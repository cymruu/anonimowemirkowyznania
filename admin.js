var express = require('express');
var jwt = require('jsonwebtoken');
var adminRouter = express.Router();
var mongoose = require('mongoose');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var auth = require('./controllers/authorization.js');
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
      return res.render('./admin/login.jade', {user: {}, error: 'Nie znaleziono uzytkownia'});
    }
    if(user.password == req.body.password){
      //success login
      var token = jwt.sign(user, config.secret, {expiresIn: 1440*60});
      res.cookie('token', token);
      res.redirect('/admin/confessions');
    }else{
      return res.render('./admin/login.jade', {user: {}, error: 'Błędne hasło'});    }
  });
});
adminRouter.get('/logout', (req, res)=>{
  res.clearCookie('token');
  return res.render('./admin/login.jade', {user: {}, error: 'Wylogowano'});
});
adminRouter.use(auth);
adminRouter.get('/', (req, res)=>{
  res.redirect('/admin/confessions');
});
adminRouter.get('/details/:confession_id', (req, res)=>{
  confessionModel.findById(req.params.confession_id).populate({path:'actions', options:{sort: {_id: -1}}, populate: {path: 'user', select: 'username'}}).exec((err, confession)=>{
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
