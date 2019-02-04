const permissions = [ 'addEntry', 'deleteEntry', 'addReply', 'deleteReply', 'setStatus', 'viewDetails', 'updateTags', 'accessPanel', 'accessMessages', 'accessModsList', 'canChangeUserPermissions', 'viewIP'];

const permissionObject = {};
permissions.forEach((p, i) => {
  permissionObject[p] = 1 << i;
});

function getFlag(permits) {
  permits=permits||[];
  var flag = 0;
  for (var i = 0; i < permits.length; i++) {
    flag|=permissionObject[permits[i]];
  }
  return flag;
}
function checkIfIsAllowed(flag, action){
  return Boolean(flag&permissionObject[action]);
}
function flipPermission(userFlag, permission=''){
  if(!(permission in permissionObject))return userFlag;
  return userFlag ^= (permissionObject[permission]);
}
function getFlagPermissions(flag){
  var r = {};
  permissions.forEach(permission => {
    r[permission]=checkIfIsAllowed(flag, permission);
  });
  return r;
}
function accessMiddleware(permission){
  return function(req, res, next){
    if(!checkIfIsAllowed(req.user.flags, permission))
    {
      return res.json({success: false, response: {message: 'You\'re not allowed to perform this action'}});
    }
    next();
  }
}
module.exports = {checkIfIsAllowed, accessMiddleware, flipPermission, getFlagPermissions}
