const express= require("express")
const app=express()
const port=process.env.port || 5000



// all api links is form here.


app.get("/",async(req,res)=>{
    res.send(`this server is running on ${port} port`)
})





// app listner.

app.listen(port,()=>console.log(`Server is running on ${"http://localhost:5000"}`))