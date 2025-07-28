const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch( (err)=> next(err) )
    }
}
export {asyncHandler}





/*
Using try catch
(Higher Order Function is a Function that accept a function as a Parameter)

// const asyncHandler = (fn)=> { ()=>{} }  // higher order function ( we remove the braces)

const asyncHandler = (fn)=> async (req,res,next)=>{

    try {
        await fn(req,res,next);
    } catch (err) {
        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })        
    }
}

*/