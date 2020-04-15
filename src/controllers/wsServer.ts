const WebSocketServer = require('ws').Server
import url from 'url'
import * as conversationController from './conversations'
import logger from '../logger'
import config from '../config'

export let wss
export function bindWebsocketToServer(server) {
	wss = new WebSocketServer({ server, port: config.websocketPort })
	wss.sendToChannel = function broadcast(channel, data) {
		wss.clients.forEach(function each(client) {
			if (client.readyState === 1 && client.conversation === channel) {
				client.send(data)
			}
		})
	}
	function onMessage(ws, message) {
		try {
			message = JSON.parse(message)
		} catch (e) {
			return ws.send(JSON.stringify({ type: 'alert', body: 'Coś się popsuło.' }))
		}
		const time = new Date()
		switch (message.type) {
		case 'chatMsg':
			if (message.msg.length > 4096) {
				return ws.send(JSON.stringify({ type: 'alert', body: 'Wiadomość za długa.' }))
			}
			if ((time.getTime() - (ws.lastMsg as Date)?.getTime()) < 1000) {
				return ws.send(JSON.stringify({ type: 'alert', body: 'Wysyłasz wiadomości za szybko.' }))
			}
			ws.lastMsg = time
			conversationController.newMessage(ws.conversation, ws.auth, message.msg, ws.IPAdress, (err, isOP) => {
				if (err) {return ws.send(JSON.stringify({ type: 'alert', body: err }))}
				wss.sendToChannel(ws.conversation, JSON.stringify({
					type: 'newMessage',
					msg: message.msg, username: isOP ? 'OP' : 'Użytkownik mikrobloga',
				}))
			})
			break
		default:
			ws.send(JSON.stringify({ type: 'alert', body: 'unknown message type' }))
		}
	}
	wss.on('connection', function(ws, req) {
		ws.on('error', (err) => {
			logger.error(err)
		})
		const url_parts = url.parse(req.url, true)
		const params = url_parts.query
		ws.conversation = params.conversation
		ws.auth = params.auth
		ws.IPAdress = ws._socket.remoteAddress
		conversationController.validateAuth(params.conversation, params.auth, (err, result) => {
			if (err) {
				logger.error(err)
				ws.send(JSON.stringify({ type: 'alert', body: err.toString() }))
			}
			if (result) {ws.authorized = true}
			ws.on('message', (message) => { onMessage(ws, message) })
			return
		})
	})
}
