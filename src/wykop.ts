import config from './config'
import { Wykop, Client, CreateWykopService } from '../wypokjs/dist/index.js'

const wykop = new Wykop(config.wykopConfig)
const client = new Client(wykop, config.wykopClientConfig)
const service = CreateWykopService(client)

module.exports = { client: wykop, service }
