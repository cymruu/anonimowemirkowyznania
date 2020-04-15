/* eslint-disable max-len */
import tagController from './tags'
import adsModel from '../models/ads'
import config from '../config'

function getEntryBody(confession, user, cb) {
	let entryBody = tagController.trimTags(`#anonimowemirkowyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](${config.siteURL}/reply/${confession._id}) \n[Kliknij tutaj, aby wysłać OPowi anonimową wiadomość prywatną](${config.siteURL}/conversation/${confession._id}/new) \nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( ${config.siteURL} ) Zaakceptował: [${user.username}](${config.siteURL}/conversation/U_${user.username}/new)`, confession.tags)
	adsModel.random(function(err, randomAd) {
		if (err || !randomAd) { return cb(entryBody) }
		const caption = randomAd.captions[Math.floor(Math.random() * randomAd.captions.length)]
		// entryBody+=`\nDodatek wspierany przez: [${caption}](https://${config.siteURL}/link/${randomAd._id}/${confession._id})}`
		if (randomAd) { entryBody += `\nDodatek wspierany przez: [${caption}](${randomAd.out})` }
		return cb(entryBody)
	})
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
function getEntryBodyDev(confession, user, cb) {
	const entryBody = tagController.trimTags(`${confession.text}\n\n ${confession._id}`, confession.tags)

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
const bodyBuilder = this.process.env.NODE_ENV === 'development' ?
	{ getEntryBodyDev, getNotificationCommentBodyDev, getCommentBodyDev } :
	{ getEntryBody, getNotificationCommentBody, getCommentBody }
export default bodyBuilder
