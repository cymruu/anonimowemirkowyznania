import csrf from 'csurf'

export const csrfProtection = csrf({ cookie: true })

export function csrfErrorHander(err, req, res, next) {
	if (err.code === 'EBADCSRFTOKEN') {
		return res.status(403).send('bad csrf token')
	}
	next(err)
}
