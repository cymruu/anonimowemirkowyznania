/* eslint-disable max-len */
import * as tagController from './tags'
import adsModel from '../models/ads'
import config from '../config'
import donationModel from '../models/donation'
import { makeProgressBar } from '../utils/progressBar'

async function getEntryBody(confession, user, cb) {
	let entryBody = tagController.trimTags(`#anonimowemirkowyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](${config.siteURL}/reply/${confession._id}) \n[Kliknij tutaj, aby wysłać OPowi anonimową wiadomość prywatną](${config.siteURL}/conversation/${confession._id}/new) \nID: #${confession._id}\nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( ${config.siteURL} ) Zaakceptował: [${user.username}](${config.siteURL}/conversation/U_${user.username}/new)`, confession.tags)
	const [randomAd, totalAmountDonated] = await Promise.all([adsModel.random(), donationModel.totalInCurrentYear()])
	if (randomAd) {
		const caption = randomAd.captions[Math.floor(Math.random() * randomAd.captions.length)]
		// entryBody+=`\nDodatek wspierany przez: [${caption}](https://${config.siteURL}/link/${randomAd._id}/${confession._id})}`
		entryBody += `\n[${caption}](${randomAd.out})`
	}
	entryBody += `\n\`${makeProgressBar(totalAmountDonated)}\``

	return cb(entryBody)
}
function getNotificationCommentBody(confession) {
	return `Zaplusuj ten komentarz, aby otrzymywać powiadomienia o odpowiedziach w tym wątku. [Kliknij tutaj, jeśli chcesz skopiować listę obserwujących](${config.siteURL}/followers/${confession._id})`
}
function getCommentBody(reply, user) {
	let authorized = ''
	if (reply.authorized) {
		authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**'
	}
	return `**${reply.alias}**: ${reply.text}\n${authorized}\nZaakceptował: [${user.username}](${config.siteURL}/conversation/U_${user.username}/new)`
}
async function getEntryBodyDev(confession, user, cb) {
	let entryBody = tagController.trimTags(`${confession.text}\n\n ${confession._id}\n\n #wykopapitesty \n!dostałem ostrzeżenie za flood, to może nam dajcie testowe środowisko api?`, confession.tags)
	const [randomAd, totalAmountDonated] = await Promise.all([adsModel.random(), donationModel.totalInCurrentYear()])
	if (randomAd) {
		const caption = randomAd.captions[Math.floor(Math.random() * randomAd.captions.length)]
		// entryBody+=`\nDodatek wspierany przez: [${caption}](https://${config.siteURL}/link/${randomAd._id}/${confession._id})}`
		if (randomAd) { entryBody += `\n[${caption}](${randomAd.out})` }
	}
	entryBody += `\n\`${makeProgressBar(totalAmountDonated)}\``
	cb(entryBody)
}
function getNotificationCommentBodyDev(confession) {
	return `for ${confession.entryID}`
}
function getCommentBodyDev(reply, user) {
	let authorized = ''
	if (reply.authorized) {
		authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**'
	}
	return `**${reply.alias}**: ${reply.text}\n${authorized}\n`
}
const bodyBuilder = process.env.NODE_ENV === 'development' ?
	{ getEntryBody: getEntryBodyDev, getNotificationCommentBody: getNotificationCommentBodyDev, getCommentBody: getCommentBodyDev } :
	{ getEntryBody, getNotificationCommentBody, getCommentBody }
export default bodyBuilder
