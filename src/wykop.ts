import config from './config'
import { Wykop, Client, CreateWykopService, errorInterceptor } from 'wypokjs'
import logger from './logger'
import { WykopQueue } from './service/WykopQueue'

const logInterceptor: errorInterceptor = (err) => {
	logger.error(err.toString())
	return err
}

const wykop = new Wykop(config.wykopConfig, [logInterceptor])
const client = new Client(wykop, config.wykopClientConfig)
export const WykopRequestQueue = new WykopQueue(5000, 5)
WykopRequestQueue.startProcessing()
export const service = CreateWykopService(client)
