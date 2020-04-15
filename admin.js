var express = require('express');
var jwt = require('jsonwebtoken');
var adminRouter = express.Router();
var mongoose = require('mongoose');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var conversationModel = require('./models/conversation.js');
var auth = require('./controllers/authorization.js');
var accessMiddleware = require("./controllers/access.js").accessMiddleware;
var getFlagPermissions = require("./controllers/access.js").getFlagPermissions;
var checkIfIsAllowed = require("./controllers/access.js").checkIfIsAllowed;
var flipPermission = require("./controllers/access.js").flipPermission;
var replyModel = require('./models/reply.js');
var userModel = require('./models/user.js');
//authoriztion
adminRouter.get('/login', (req, res) => {
  res.render('./admin/login.pug', { user: {} });
});
adminRouter.post('/login', (req, res) => {
  userModel.findOne({
    username: req.body.username
  }, { _id: 1, username: 1, password: 1, flags: 1 }, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.render('./admin/login.pug', { user: {}, error: 'Nie znaleziono uzytkownia' });
    }
    if (user.password === req.body.password) {
      //success login
      delete user.password;
      var token = jwt.sign({ _id: user._id, username: user.username, flags: user.flags, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, config.secret);
      res.cookie('token', token);
      res.redirect('/admin/confessions');
    } else {
      return res.render('./admin/login.pug', { user: {}, error: 'Błędne hasło' });
    }
  });
});
adminRouter.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.render('./admin/login.pug', { user: {}, error: 'Wylogowano' });
});
adminRouter.use(auth(true));
adminRouter.get('/', accessMiddleware('accessPanel'), (req, res) => {
  res.redirect('/admin/confessions');
});
adminRouter.get('/details/:confession_id', accessMiddleware('viewDetails'), (req, res) => {
  confessionModel.findById(req.params.confession_id).populate([{ path: 'actions', options: { sort: { _id: -1 } }, populate: { path: 'user', select: 'username' } }, { path: 'survey' }]).exec((err, confession) => {
    if (err) return res.send(err);
    if (!confession) return res.sendStatus(404);
    confessionModel.find({ IPAdress: confession.IPAdress }, { _id: 1, status: 1 }, function (err, results) {
      if (err) return res.send(err);
      confession.addedFromSameIP = results;
      res.render('./admin/details.pug', { user: req.user, confession });
    });
  });
});
adminRouter.get('/details/:confession_id/ip', accessMiddleware('viewDetails'), accessMiddleware('viewIP'), (req, res) => {
  confessionModel.findById(req.params.confession_id, (err, confession) => {
    if (err) return res.send(err);
    if (!confession) return res.sendStatus(404);
    res.send(confession.IPAdress);
  });
});
adminRouter.get('/confessions/:filter?', accessMiddleware('accessPanel'), (req, res) => {
  var search = {};
  req.params.filter ? search = { status: req.params.filter } : search = {};
  confessionModel.find(search).sort({ _id: -1 }).limit(100).exec((err, confessions) => {
    if (err) res.send(err);
    res.render('./admin/confessions.pug', { user: req.user, confessions: confessions });
  });
});
adminRouter.get('/replies', accessMiddleware('accessPanel'), (req, res) => {
  replyModel.find().populate('parentID').sort({ _id: -1 }).limit(100).exec((err, replies) => {
    if (err) res.send(err);
    res.render('./admin/replies.pug', { user: req.user, replies: replies });
  });
});
adminRouter.get('/messages/', accessMiddleware('accessMessages'), (req, res) => {
  conversationModel.find({ 'userID': req.user._id }, { _id: 1 }, { sort: { 'messages.time': -1 }, limit: 200 }, (err, conversations) => {
    if (err) return res.send(err);
    res.render('./admin/messages.pug', { user: req.user, conversations });
  });
});
adminRouter.get('/mods/', accessMiddleware('accessModsList'), (req, res) => {
  userModel.find({}, { username: 1, flags: 1 }).lean().then(userList => {
    userList.forEach((user) => {
      user.permissions = getFlagPermissions(user.flags);
      return user;
    });
    res.render("./admin/mods.pug", { user: req.user, userList: userList, canChangeUserPermissions: checkIfIsAllowed(req.user.flags, "canChangeUserPermissions") });
  }, err => {
    res.json({ err });
  });
});
adminRouter.get('/mods/flip/:targetId/:permission', accessMiddleware('canChangeUserPermissions'), (req, res) => {
  userModel.findOne({ _id: req.params.targetId }, { username: 1, flags: 1 }).then(target => {
    target.flags = flipPermission(target.flags, req.params.permission);
    target.save().then(result => {
      res.redirect('/admin/mods');
    }, err => {
      res.json({ err });
    });
  }, err => {
    res.json({ err });
  });
});
module.exports = adminRouter;
