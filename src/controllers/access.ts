import { makeAPIResponse } from '../apiv2/utils/response'

const permissions = [
	'addEntry', 'deleteEntry', 'addReply', 'deleteReply', 'setStatus', 'viewDetails', 'updateTags', 'accessPanel',
	'accessMessages', 'accessModsList', 'canChangeUserPermissions', 'viewIP', 'accessDonations', 'addDonations',
] as const

type permissionType = typeof permissions[number]

const permissionObject = {}
permissions.forEach((p, i) => {
	permissionObject[p] = 1 << i
})

function getFlag(permits) {
	permits = permits || []
	let flag = 0
	for (let i = 0; i < permits.length; i++) {
		flag |= permissionObject[permits[i]]
	}
	return flag
}
export function checkIfIsAllowed(flag, action) {
	return Boolean(flag & permissionObject[action])
}
export function flipPermission(userFlag, permission = '') {
	if (!(permission in permissionObject)) { return userFlag }
	return userFlag ^= (permissionObject[permission])
}
export function getFlagPermissions(flag) {
	const r = {}
	permissions.forEach(permission => {
		r[permission] = checkIfIsAllowed(flag, permission)
	})
	return r
}

type getErrorObjectT = (res) => object
const accessMiddleware = (permission: permissionType, getErrorObject: getErrorObjectT) => (req, res, next) => {
	if (!req.user || !checkIfIsAllowed(req.user.flags, permission)) {
		return res
			.status(403)
			.json(getErrorObject(res))
	}
	next()
}

const messageText = 'You\'re not allowed to perform this action'
export function accessMiddlewareV1(permission: permissionType) {
	const getErrorObject = () => ( { success: false, response: { message: messageText } })
	return accessMiddleware(permission, getErrorObject)
}

export function accessMiddlewareV2(permission: permissionType) {
	const getErrorObject = (res) => makeAPIResponse(res, null, { message: messageText })
	return accessMiddleware(permission, getErrorObject)
}
