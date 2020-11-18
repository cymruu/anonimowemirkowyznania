import { IUser } from './models/user'
import { Request } from 'express'

export interface RequestWithUser<T = any> extends Request<any, any, T> {
    user?: IUser;
}
