class ApiResponce {
    constructor(statusCode,data,message=true){
        this.statusCode =statusCode
        this.data=data,
        this.message=message,
        this.success=statusCode<400
    }
}

export {ApiResponce}