var wykop = require('../wykop.js');
wykopController = {
  /**
   * http://www.wykop.pl/ludzie/Nevertheless/ prosił o to
   * @param  {[int]}   entryID
   * @param  {Function} cb      callback
   * @return {[callback]}
   */
  analyzeVoters: function(entryID, cb){
    wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
      if(err)return cb(err);
      var voters = {sex:{male:0,female:0,nosex:0}, kolor:{zielonki:0,pomaranczki:0,bordowi:0,administratorzy:0,zbanowani:0,usunieci:0,klienci:0}};
      for(var i in entry.voters){
        var current = entry.voters[i];
        switch (current.author_sex) {
          case 'male':
            voters.male++;
            break;
          case 'female':
            voters.sex.female++;
            break;
          default:
            voters.sex.nosex++;
          break;
        }
        switch (current.author_group) {
          case 0:
            voters.kolor.zielonki++;
            break;
          case 1:
            voters.kolor.pomaranczki++;
            break;
          case 2:
            voters.kolor.bordowi++;
            break;
          case 5:
            voters.kolor.administratorzy++;
            break;
          case 1001:
            voters.kolor.zbanowani++;
            break;
          case 1002:
            voters.kolor.usunieci++;
            break;
          case 2001:
            voters.kolor.klienci++;
            break;
      }
    }
      return cb(null, voters);
    });
  },
  getFollowers: function(entryID, notificationCommentId, cb){
    console.log(entryID, notificationCommentId);
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
      console.log(followers);
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
  }
}
module.exports = wykopController;
