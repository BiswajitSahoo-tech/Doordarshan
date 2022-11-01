const mongoose = require('mongoose')
const app = require('./app')
const dotenv = require('dotenv')

dotenv.config({
    path: './config.env'
})
 


const DB = process.env.DATABASE
    
mongoose.connect(DB, {
    useNewUrlParser: true,
    
    useUnifiedTopology: true
}).then( con=> {
    console.log('DB connection successfull');
}) 


const port =process.env.PORT || 8000
app.listen(port, ()=>{
    console.log('server is waiting........')
})