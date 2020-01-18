function getNotificationType(type){
  var types = {
    'success': 'success',
    'warning': 'warning',
    'danger': 'error'
  }
  return types[type];
}
function notify(type, message){
  return swal({
    title: message,
    text: "Ta wiadomość ulegnie samozniszczeniu za 2 sekundy!",
    type: getNotificationType(type),
    timer: 2000
  });
}
$('.actionButton').click(function(){
  var obj = $(this);
  var parent = obj.parent().parent();
  var span = obj.next();
  var endpoint = `/api/${obj.data("object")}/${obj.data("action")}/${obj.data("id")}`;
  if(obj.data("action")=='tags'){
    endpoint+=`/${obj.data("tag")}`
  }
  if(obj.data('action')=='danger'&&obj.data('object')=='confession'&&parent.hasClass('warning')){
    var reason = prompt("Wpisz powód odrzucenia wyznania (możesz zostawić puste)");
    endpoint+='/'+encodeURIComponent(reason);
  }
  $.ajax({
      type: "GET",
      url: endpoint,
  })
  .done(function( response ) {
      if(obj.data("action")=='tags'){
        span.toggleClass("glyphicon glyphicon-ok text-success").toggleClass("glyphicon glyphicon-remove text-danger");
      }
      else {
        parent.removeClass().toggleClass(response.response.status);
      }
      notify(response.response.status, response.response.message);
  })
  .fail(function(err){
    notify('error', `HTTP ERROR [${err.status}] - ${err.statusText}`);
  });
});
