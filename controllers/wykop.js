var wykop = require('../wykop.js');
wykopController = {
  getFollowers: function(entryID, notificationCommentId, cb){
    var followers = [];
    if(!notificationCommentId){
      return cb(followers);
    }
    wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
      if(err)return console.log(err);
      for(var i in entry.comments){
        var current = entry.comments[i];
        if (current.id == notificationCommentId){
          if(current.voters){
            for(i in current.voters){
              followers.push(current.voters[i].author);
            }
          }
        }
      }
      return cb(followers);
    });
  },
  /**
   * get entry participants
   * @param  {int}   entryID entryID
   * @param  {Function} cb      callback
   */
  getParticipants: function(entryID, cb){
    wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
      var participants = [];
      if(err) return cb(err);
      participants.push(entry.author);
      for(var i in entry.comments){
        if(participants.indexOf(entry.comments[i].author)==-1){
        participants.push(entry.comments[i].author);
        }
      }
      cb(null, participants);
    });
  },
  deleteEntry: function(entryID, cb){
    wykop.request('Entries', 'Delete', {params: [entryID]}, (err, response)=>{
      if(err) return cb(err);
      return cb(null, response);
    });
  }
}
module.exports = wykopController;
