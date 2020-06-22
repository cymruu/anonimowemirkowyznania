import axios, { AxiosInstance } from 'axios'
import config from '../config'
import { ISurvey } from '../models/survey'
import { IConfession } from '../models/confession'
import qs from 'qs'
import logger from '../logger'

const idRegex = /data-id=\\"(\d{8})\\"/
const hashRegex = /"([a-f0-9]{32}-\d{10})"/
const embedHashRegex = /"hash":"([A-Za-z0-9]{32})/
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0'

class WykopHTTPClientClass {
	private _http: AxiosInstance
	private hash: string

	constructor(private username, private password: string) {
		this._http = axios.create({
			baseURL: 'https://www.wykop.pl', //"www" in url is essential
			timeout: 5000,
			headers: {
				'User-Agent': userAgent,
			},

		})
		this.login()
	}
	private login() {
		const formData = qs.stringify({
			'user[username]': this.username,
			'user[password]': this.password,
		})
		this._http.post('/zaloguj',
			formData,
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				maxRedirects: 0,
				validateStatus: (status) => {
					return status >= 200 && status < 303
				},
			})
			.then(res => {
				if (res.status === 302) {
					const cookies: string[] = res.headers['set-cookie']
					const cookieHeader = cookies.map(x => x.split(';')[0]).join('; ')
					this._http.defaults.headers.Cookie = cookieHeader
					logger.debug(`Saving authorization cookies ${cookieHeader}`)
					logger.info('HTTP client logged in')
				} else {
					throw new Error('Wykop didn\'t redirect')
				}
			})
			.then(() => {
				return this.getHash()
			})
			.catch(err => {
				logger.warn(`HTTP client failed login: ${err.toString()}`)
			})

	}
	public acceptSurvey(confession: IConfession & {survey: ISurvey}, entryBody: string, adultMedia: boolean) {
		const formData = {
			body: entryBody,
			'survey[question]': confession.survey.question,
			'survey[answers]': confession.survey.answers.map(x => x),
			attachment: undefined,
			...adultMedia ? { adultmedia: 'on' } : undefined,
		}
		// eslint-disable-next-line max-len
		const attachmentPromise = confession.embed ? this.uploadAttachment(confession.embed) : Promise.resolve(undefined)
		return attachmentPromise.then(attachmentHash => {
			formData.attachment = attachmentHash
			return this._http.post(`/ajax2/wpis/dodaj/hash/${this.hash}`, qs.stringify(formData))
				.then(res => {
					const entryId = res.data.match(idRegex)[1]
					return { id: entryId }
				})
		}).catch(err => {
			logger.error(`HTTP client request failed: ${err.toString}`)
			logger.info('relogin HTTP client')
			this.login()
			throw err
		})
	}
	private uploadAttachment(embed: string) {
		return this._http.post(`/ajax2/embed/url/hash/${this.hash}`, qs.stringify({ url: embed })).then(res => {
			const attachmentHash = res.data.match(embedHashRegex)[1]
			return attachmentHash
		})
	}
	private async getHash() {
		return this._http.get('/info').then(res => {
			this.hash = res.data.match(hashRegex)[1]
			logger.debug(`Fetched authorization hash ${this.hash}`)
		})
	}
}
const WykopHTTPClient = new WykopHTTPClientClass(config.wykopClientConfig.username, config.wykopClientConfig.password)

export default WykopHTTPClient
