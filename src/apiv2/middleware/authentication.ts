import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../../config'
import { RequestWithUser } from 'src/utils'

export function authentication(req: Request, res: Response, next) {
	const token = req.cookies.token
	let decoded
	try {
		decoded = jwt.verify(token, config.secret)
	} catch (error) {
		return res.status(401).json({ success: false, error: 'Unauthorized' })
	}
	(req as RequestWithUser).user = decoded
	next()

}
