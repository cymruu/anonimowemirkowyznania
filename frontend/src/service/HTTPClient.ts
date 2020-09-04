class HTTPClient{
    get(endpoint: string){
        return fetch(`api2/${endpoint}`).then(response=>{
            if(!response.ok){
                throw response
            }
            return response
        })
    }
    private request(endpoint: string, method: string, body: object){
        return fetch(`api2/${endpoint}`, {
            method,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
    }
    post(endpoint: string, body: object){
        return this.request(endpoint, 'post', body)
    }
    put(endpoint: string, body: object){
        return this.request(endpoint, 'put', body)
    }
}

export default new HTTPClient()