if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'production'
}
import './database'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import http from 'http'
import auth from './controllers/authorization'
import logger from './logger'
import './models/action'

import confessionModel from './models/confession'


const app = express()

app.enable('trust proxy')
app.use(helmet({
	contentSecurityPolicy: false,
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: false
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))


app.use(auth(false))
app.set('view engine', 'pug')


app.get('/confession/:confessionid/:auth', (req, res) => {
	if (!req.params.confessionid || !req.params.auth) {
		return res.sendStatus(400)
	} else {
		confessionModel.findOne({
			_id: req.params.confessionid,
			auth: req.params.auth,
		})
			.populate([
				{
					path: 'actions', options: { sort: { _id: -1 } },
					populate: { path: 'user', select: 'username' },
				}])
			.exec((err, confession) => {
				if (err) {
					console.log(err);
					return res.send(err)
				}
				if (!confession) { return res.sendStatus(404) }
				res.render('confession', { confession: confession })
			})
	}
})

app.use(function(req, res) {
	res.redirect('https://wykop.pl/wpis/70042861');
});

export const server = http.createServer(app)

const _port = process.env.PORT || 8080

server.listen(_port, () => {
	logger.info(`Server started on port: ${_port} [${process.env.NODE_ENV}]`)
})
