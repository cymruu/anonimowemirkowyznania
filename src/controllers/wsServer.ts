import { Server as WebSocketServer } from 'ws'
import url from 'url'
import * as conversationController from './conversations'
import logger from '../logger'
import config from '../config'
import fs from 'fs'
import { createServer } from 'https'
let server

const serverCreatedCallback = () => {
	logger.info(`Websocket server started ${config.websocketPort}`)
}

if (process.env.NODE_ENV === 'production' && fs.existsSync('./certs/cert.key') && fs.existsSync('./certs/cert.pem')) {
	const options = { key: undefined, cert: undefined }
	logger.info('Loading certificates for Websockets server')
	options.key = fs.readFileSync('./certs/cert.key')
	options.cert = fs.readFileSync('./certs/cert.pem')

	server = createServer(options, (_, res) => {
		res.writeHead(200)
		res.end('AMW secure chat server\n')
	})
	server.listen(config.websocketPort, serverCreatedCallback)
}

export const isSecureServer = !!server

export const wss = new WebSocketServer(
	{ server, port: isSecureServer ? undefined : config.websocketPort },
	serverCreatedCallback,
)

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
