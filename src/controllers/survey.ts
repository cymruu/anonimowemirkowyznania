import request from 'request'
import config from '../config'
import { createAction, ActionType } from './actions'
import surveyModel, { ISurvey } from '../models/survey'
import bodyBuildier from './bodyBuildier'
import { IConfession } from 'src/models/confession'

const loginEndpoint = 'https://www.wykop.pl/zaloguj/'
// const addEntryEndpoint = 'http://www.wykop.pl/xhr/entry/create/';
const addEntryEndpoint = 'https://www.wykop.pl/ajax2/wpis/dodaj/hash/'
// const uploadAttachmentEndpoint = 'http://www.wykop.pl/xhr/embed/url/';
const uploadAttachmentEndpoint = 'https://www.wykop.pl/ajax2/embed/url/hash/'
const idRegex = /data-id=\\"(\d{8})\\"/
const hashRegex = /"([a-f0-9]{32}-\d{10})"/
const embedHashRegex = /"hash":"([A-Za-z0-9]{32})/
const wykopSession = request.jar()
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0'
let hash
export function validateSurvey(survey) {
	if (survey.question.length < 5) {
		return { success: false, response: { message: 'Pytanie jest za krotkie.' } }
	}
	if (survey.answers.length < 2) {
		return { success: false, response: { message: 'Musisz podać przynajmniej 2 odpowiedzi.' } }
	}
	if (survey.answers.length > 10) {
		return { success: false, response: { message: 'Nie moze byc wiecej niz 10 odpowiedzi.' } }
	}
	if (survey.question.length > 100) {
		return { success: false, response: { message: 'Maksymalna długość pytania to 100 znakow.' } }
	}
	for (const i in survey.answers) {
		if (survey.answers[i].length > 50) {
			return { success: false, response: { message: 'Maksymalna długość odpowiedzi to 50 znakow.' } }
		}
	}
	return { success: true }
}
export function saveSurvey(confession, surveyData) {
	const survey = new surveyModel()
	survey.question = surveyData.question
	for (const i in surveyData.answers) {
		if (surveyData.answers[i]) {
			survey.answers.push(surveyData.answers[i])
		}
	}
	survey.save((err) => {
		if (err) { return }
		confession.survey = survey._id
		confession.save((err) => {
			if (err) { return false }
			return true
		})
	})
}
export function wykopLogin() {
	request({
		method: 'POST',
		url: loginEndpoint,
		form: {
			'user[username]': config.wykopClientConfig.username,
			'user[password]': config.wykopClientConfig.password,
		},
		jar: wykopSession,
		headers: { 'User-Agent': userAgent },
	}, function(err, response, body) {
		if (!err && response.statusCode === 302) {
			//logged in
			request({ method: 'GET', url: 'https://www.wykop.pl/info/', jar: wykopSession },
				function(err, response, body) {
					if (response.statusCode === 200) {
						hash = body.match(hashRegex)[1]
					}
				})
		}
	})
}
export function acceptSurvey(confession: IConfession & {survey: ISurvey}, entryBody: string) {
	return new Promise((resolve, reject) => {
		uploadAttachment(confession.embed, (result) => {
			if (!result.success) {
				return Promise.reject({ message: 'Error while trying to upload attachment' })
			}
			//its required for some reason
			//otherwise CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
			const answers = confession.survey.answers.map((v) => { return v })
			const data = {
				body: entryBody,
				attachment: result.hash,
				'survey[question]': confession.survey.question,
				'survey[answers]': answers,
			}
			request({
				method: 'POST',
				url: addEntryEndpoint + hash,
				form: data, jar: wykopSession,
			}, async function(err, response, body) {
				let entryId
				if (err) {
					return reject({ message: 'Error while trying to make request to wykop' })
				}
				if (!(body.substr(0, 8) === 'for(;;);')) {
					return reject({ message: 'Error wykop returned malformed response' })
				}
				try {
					entryId = body.match(idRegex)[1]
				} catch (e) {
					let flag;
					(body.search('Sesja') > -1) ? flag = true : flag = false
					return reject({ relogin: true, message: 'Sesja wygasła' })
				}
				return resolve({ id: entryId })
			})
		})
	})
}
const uploadAttachment = function(url, cb) {
	if (!url) { return cb({ success: true, hash: null }) }
	request({ method: 'POST', url: uploadAttachmentEndpoint + hash, form: { url } }, function(err, response, body) {
		if (err) { return cb({ success: false }) }
		try {
			hash = body.match(embedHashRegex)[1]
		} catch (e) {
			return cb({ success: false })
		}
		return cb({ success: true, hash: hash })
	})
}
wykopLogin()
