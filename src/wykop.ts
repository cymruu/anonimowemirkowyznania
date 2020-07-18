import config from './config'
import { Wykop, Client, CreateWykopService } from 'wypokjs'

export const wykop = new Wykop(config.wykopConfig)
export const client = new Client(wykop, config.wykopClientConfig)
export const service = CreateWykopService(client)
