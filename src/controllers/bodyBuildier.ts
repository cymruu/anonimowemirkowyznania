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

async function getEntryBody(confession, user) {
	let entryBody = ''
	entryBody += tagController.trimTags(getBody(confession, user), confession.tags)
	const randomAd = await adsModel.random()
	if (randomAd) {
		const caption = randomAd.captions[Math.floor(Math.random() * randomAd.captions.length)]
		// entryBody+=`\nDodatek wspierany przez: [${caption}](https://${config.siteURL}/link/${randomAd._id}/${confession._id})}`
		entryBody += `\n[${caption}](${randomAd.out})`
	}

	return entryBody
}
function getCommentBody(reply, user) {
	let authorizedMsg = ''
	if (reply.authorized) {
		authorizedMsg = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**'
	}
	return `**${reply.alias}**: ${reply.text}\n${authorizedMsg}\nZaakceptował: [${user.username}](${config.siteURL}/conversation/U_${user.username}/new)`
}

async function getDonationEntryBody(donation: IDonation) {
	const donor = donation.from || 'Anonimowy'
	const totalAmountDonated = await donationModel.totalDonationSum()
	const message = donation.message || '...'
	let entryBody = '#anonimowemirkodonacje\n Nowa donacja na rzecz #anonimowemirkowyznania\n'
	entryBody += `\n${donor}: ${message} - ${donation.amount}zł**\n`
	const yearsFounded = Math.trunc(totalAmountDonated / 235)
	const donationsForCurrent = totalAmountDonated % 235
	entryBody += `\n\`${makeProgressBar(donationsForCurrent)}\``

	if (yearsFounded) {
		entryBody += `\n Uzbieraliśmy już na ${yearsFounded} lat działania AMW!`
	}

	entryBody += `\nJeśli jestś zainteresowany przekazaniem donacji na rzecz inicjatywy AMW możesz to zrobić przechodząc na [tę stronę](${config.siteURL}/donate)`

	return entryBody
}
export default { getEntryBody, getCommentBody, getDonationEntryBody }
