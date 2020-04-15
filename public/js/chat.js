const serverProtocol = isSecureServer ? 'wss' : 'ws';
var websocketUrl = `${location.protocol.replace("http", "ws")}//${location.hostname}:${websocketPort}/?conversation=${conversationId}&auth=${authCode}`;
var ws = new WebSocket(websocketUrl);
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}
ws.onopen = function () {
  ws.onmessage = handleMessage;
  $(".status-circle").css('background-color', '#83f441');
}
ws.onclose = function () {
  $(".status-circle").css('background-color', '#f44242');
}
handleMessage = function (message) {
  var message = JSON.parse(message.data);
  switch (message.type) {
    case 'newMessage':
      message.msg = escapeHtml(message.msg);
      var html = `<div class=\"row message-bubble message-body ${message.username == 'OP' ? 'operator' : ''}\"><p class=\"text-muted\">${message.username}<span class="time pull-right">${new Date()}</span></p><span>${message.msg}</span></div>`;
      $('#messages').append(html);
      break;
    default:
      alert(message.body);
  }
}
sendMessage = function (msg) {
  msg = msg.trim();
  if (!msg) return alert('Wpisz wiadomość');
  if (msg.length > 4096) return alert('Wiadomość jest za długa. Możesz wysłać długą wiadomość jako kilka krótszych');
  ws.send(JSON.stringify({ type: 'chatMsg', msg: msg }));
  $("#messageBox").val('');
}
$('.sendMessage').click(function () {
  var msg = $('#messageBox').val();
  sendMessage(msg);
});
$("#messageBox").keypress(function (event) {
  if (event.which == 13 && !event.shiftKey) {
    event.preventDefault();
    var msg = $(this).val();
    sendMessage(msg);
  }
});
