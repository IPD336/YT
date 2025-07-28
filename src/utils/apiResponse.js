class ApiResponse{
    constructor(statusCode , data , message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // because status code > 400 is for error
    }
}

export {ApiResponse}