import { IUser } from './models/user'
import { Request } from 'express'

export interface RequestWithUser extends Request {
    user?: IUser;
}
