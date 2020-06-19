import surveyModel from '../models/survey'

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

