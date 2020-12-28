import { Request } from 'express'
import { DocumentQuery, model, Model, Mongoose, Document } from 'mongoose'

const DEFAULT_PER_PAGE = 100

export type PaginationQueryParams = {
    page?: string
    perPage?: string
}

interface RequestWithPaginationQueryParams extends Request{
    query: PaginationQueryParams
}

export async function getPage(
	req: RequestWithPaginationQueryParams,
	model: Model<any>,
	query: DocumentQuery<any, any>,
) {
	const page = Number(req.query.page) || 0
	const perPage = Number(req.query.perPage) || 100
	const count: number = await model.estimatedDocumentCount()

	const pageQuery = query
		.limit(perPage)
		.skip(page * perPage)
	return { pageQuery, count }
}
