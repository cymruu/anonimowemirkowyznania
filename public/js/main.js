$('.participant').click(function(){
  $('#text').val($('#text').val()+'@'+$(this).data("username")+':');
  $('#text').focus();
});
