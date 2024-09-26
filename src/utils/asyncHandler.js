const aysncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>next(err))
    }
}


export {aysncHandler}


// asyncHandler function wrapper using try and catch
// const asyncHandler=(fn)=>{}
// const asyncHandler=(fn)=>()=>{}
// const asyncHandler=(fn)=>async()=>{}


// const asyncHandler =(fn)=>async()=>{
//     try{
//         await fn(req,res,next)

//     }catch(error){
//         res.status(err.code||500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }