var wykop = require('../wykop.js');
wykopController = {
  getFollowers: function(entryID, notificationCommentId, cb){
    var followers = '!';
    if(!notificationCommentId){
      return cb(followers);
    }
    wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
      if(err)return console.log(err);
      for(i in entry.comments){
        var current = entry.comments[i];
        if (current.id == notificationCommentId){
          if(current.voters){
            for(i in current.voters){
              followers+=`@${current.voters[i].author} `;
            }
          }
        }
      }
      return cb(followers);
    });
  }
}
module.exports = wykopController;
