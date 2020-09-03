import { Router, Response } from 'express'
import { userRouter } from './userRouter'
import { confessionRouter } from './confessionRouter'

const apiRouter = Router()
apiRouter.get('/', (req, res) => {
	res.json('API v2')
})


apiRouter.use('/users', userRouter)
apiRouter.use('/confessions', confessionRouter)

export interface APIError {
	message: string
}

interface APIResponse {
	success: boolean
	status: number
	data: any
	error: APIError
}

export function makeAPIResponse(res: Response, data: object, error?: APIError) {
	return ({
		success: error === undefined,
		status: res.statusCode,
		data,
		error,
	}) as APIResponse
}

export default apiRouter
