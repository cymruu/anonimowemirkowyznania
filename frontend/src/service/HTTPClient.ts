class HTTPClient{
    get(endpoint: string){
        return fetch(`api2/${endpoint}`).then(response=>{
            if(!response.ok){
                throw response
            }
            return response
        })
    }
    post(endpoint: string, body: object){
        return fetch(`api2/${endpoint}`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

export default new HTTPClient()