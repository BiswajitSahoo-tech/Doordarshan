const Connection = require('./../model/connectionModel')

exports.getConnection = async (req, res, next)=>{
    const id = req.params.id
    try{
        const conn = await Connection.findById(id)
        res.status(200).json({
            status:'success',
            data:{
                connection: conn
            }
        })
        return;
    }catch(err){
        return next( err)
    }
    

}
exports.addConnection = async ( req, res, next)=>{
    try{
        const conn = await Connection.create( req.body)
        res.status(200).json({
            status:'success',
            data:{
                connection: conn
            }
        })
        return;
    }catch( err){
        return next( err)
    }
}

exports.updateConnection = async ( req, res, next)=>{
    try{
        const conn = await Connection.findByIdAndUpdate( req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if( !conn){
            res.status(404).json({
                status:'fail',
                msg: "no con with that id"
            })
            console.log("no con with that id", req.params.id)
        }
        res.status(200).json({
            status:'success',
            data:{
                connection: conn
            }
        })
    }catch( err){
        return next( err)
    }
}

exports.deleteConnection = async ( req, res, next)=>{
    try{
        await Connection.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:'success'
        })
    }catch( err){
        res.status('500').json({
            status:'fail',
            msg:err
        })
    }
}