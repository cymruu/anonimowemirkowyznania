import { Router, Response } from 'express'

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
