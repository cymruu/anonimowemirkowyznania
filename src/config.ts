import { env } from 'process'

export default {
	//http://www.wykop.pl/dla-programistow/twoje-aplikacje/
	wykopConfig: {
		appkey: env.WYKOP_APPKEY, //apiKey
		secret: env.WYKOP_SECRET, //app secret
	},
	wykopClientConfig: {
		accountkey: env.WYKOP_CLIENT_ACCOUNTKEY, //connection key (wykop.pl/dla-programistow/twoje-aplikacje/)
		username: env.WYKOP_CLIENT_USERNAME, //username
		password: env.WYKOP_CLIENT_PASSWORd, //password and username are required to handle surverys
	},
	siteURL: env.SITE_URL, //site url without / at end
	mongoURL: env.MONGO_URL,
	secret: env.SECRET, //website's secret key,
	stripe: {
		publishable: env.STRIPE_PUBLISHABLE,
		secret: env.STRIPE_SECRET,
	},
}
