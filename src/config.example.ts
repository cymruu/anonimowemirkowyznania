export default {
	//http://www.wykop.pl/dla-programistow/twoje-aplikacje/
	wykopConfig: {
		appkey: 'appkey', //apiKey
		secret: 'secret', //app secret
	},
	wykopClientConfig: {
		accountkey: 'connectionkey', //connection key (https://www.wykop.pl/dla-programistow/twoje-aplikacje/)
		username: 'usernam', //username
		password: 'passowrd', //password and username are required to handle surverys
	},
	siteURL: 'https://localhost:1337', //site url
	mongoURL: 'mongodb://username:password@host/database',
	secret: 'secret_for_signing_jwt', //website's secret key,
	websocketPort: 8090, //port on which a websockets server will work
}
