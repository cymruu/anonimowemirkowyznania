import config from './config'
import { Wykop, Client, CreateWykopService } from 'wypokjs'
import { WykopError } from 'wypokjs/dist/wykop'
import { AxiosError } from 'axios'
import logger from './logger'

const logInterceptor = (err: WykopError | AxiosError) => {
	logger.error(err.toString())
	return err
}

const wykop = new Wykop(config.wykopConfig, [logInterceptor])
const client = new Client(wykop, config.wykopClientConfig)
export const service = CreateWykopService(client)
