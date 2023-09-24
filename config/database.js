const mongoose = require('mongoose')

const dbconnection = ()=>{
mongoose.connect(process.env.DB_URL).then((inf)=>{
    console.log(`Database connection in ${inf.connection.host}`)
}).catch((err)=>{
    console.log(`Database Disconnect ${err}`)
    process.exit(1)
})
}

module.exports= dbconnection