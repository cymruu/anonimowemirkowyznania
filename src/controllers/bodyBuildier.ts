/* eslint-disable max-len */
import * as tagController from './tags'
import adsModel from '../models/ads'
import config from '../config'
import donationModel, { IDonation } from '../models/donation'
import { makeProgressBar } from '../utils/progressBar'
import { IConfession } from '../models/confession'
import { IUser } from '../models/user'

const getBody = (confession:IConfession, user:IUser) => {
	return process.env.NODE_ENV === 'development' ?
		`${confession.text}\n\n ${confession._id}\n\n #wykopapitesty \n!dostałem ostrzeżenie za flood, to może nam dajcie testowe środowisko api?`
		:
		`#anonimowemirkowyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](${config.siteURL}/reply/${confession._id}) \n[Kliknij tutaj, aby wysłać OPowi anonimową wiadomość prywatną](${config.siteURL}/conversation/${confession._id}/new) \nID: #${confession._id}\nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( ${config.siteURL} ) Zaakceptował: [${user.username}](${config.siteURL}/conversation/U_${user.username}/new)`
}

async function getEntryBody(confession, user, donationsToShare: IDonation[]) {
	let entryBody = donationsToShare.length ? 'Ostatnie donacje:' : ''
	for (const donation of donationsToShare) {
		const donor = donation.from || 'Anonimowy'
		const message = donation.message || '...'
		entryBody += `\n**${donor}**: ${message} **${donation.amount}zł** dziękuję!\n`
	}
	entryBody += tagController.trimTags(getBody(confession, user), confession.tags)
	const [randomAd, totalAmountDonated] = await Promise.all([adsModel.random(), donationModel.totalDonationSum()])
	if (randomAd) {
		const caption = randomAd.captions[Math.floor(Math.random() * randomAd.captions.length)]
		// entryBody+=`\nDodatek wspierany przez: [${caption}](https://${config.siteURL}/link/${randomAd._id}/${confession._id})}`
		entryBody += `\n[${caption}](${randomAd.out})`
	}
	const yearsFounded = Math.trunc(totalAmountDonated / 235)
	const donationsForCurrent = totalAmountDonated % 235
	entryBody += `\n\`${makeProgressBar(donationsForCurrent)}\``

	if (yearsFounded) {
		entryBody += `\n Uzbieraliśmy już na ${yearsFounded} lat działania AMW!`
	}
	return entryBody
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

export default { getEntryBody, getNotificationCommentBody, getCommentBody }
