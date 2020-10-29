import { Router, Response } from 'express'
import { userRouter } from './userRouter'
import { confessionRouter } from './confessionRouter'
import { replyRouter } from './replyRouter'

const apiRouter = Router()
apiRouter.get('/', (req, res) => {
	res.json('API v2')
})


apiRouter.use('/users', userRouter)
apiRouter.use('/confessions', confessionRouter)
apiRouter.use('/replies', replyRouter)

export interface APIError {
	message: string
}

interface APIResponse<T> {
	success: boolean
	status: number
	data: T
	error: APIError
}

export function makeAPIResponse<T>(res: Response, data: T, error?: APIError) {
	return ({
		success: !error,
		status: res.statusCode,
		data,
		error,
	}) as APIResponse<T>
}

export default apiRouter
