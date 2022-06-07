import { Router } from 'express';
import { accessMiddlewareV2 } from '../controllers/access';
import bodyBuildier from '../controllers/bodyBuildier';
import DonationModel from '../models/donation';
import DonationIntent from '../models/donationIntent';
import { RequestWithUser } from '../utils';
import { service } from '../wykop';
import { authentication } from './middleware/authentication';
import { makeAPIResponse } from './utils/response';

export const donationRouter = Router();


donationRouter.use(authentication)

donationRouter.get('/', accessMiddlewareV2('accessDonations'), async (req: RequestWithUser, res) => {
	DonationModel.find({}).then((donations) => {
		res.json(makeAPIResponse(res, { donations }))
	}).catch(err => {
		res.status(500).json(err)
	})
})

donationRouter.get('/intents', accessMiddlewareV2('accessDonations'), async (req: RequestWithUser, res) => {
	DonationIntent.find({}).then((donationIntents) => {
		res.json(makeAPIResponse(res, { donationIntents }))
	}).catch(err => {
		return res.status(500).json(makeAPIResponse(res, null, err))
	})
})

donationRouter.post('/', accessMiddlewareV2('addDonations'), async (req: RequestWithUser, res) => {
	const donation = new DonationModel(req.body)
	await donation.save().then(async () => {
		const entryBody = await bodyBuildier.getDonationEntryBody(donation)
		return service.Entries.Add({ body: entryBody, adultmedia: false })
	}).then(res => {
		donation.entryID = res.id
		return donation.save()
	}).then(() => {
		res.json(makeAPIResponse(res, { success: true }))
	}).catch(err => {
		res.status(500).json(makeAPIResponse(res, null, err))
	})
})
