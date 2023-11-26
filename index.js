const express = require("express");
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors=require("cors")

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://Medisch:6IeQfwJAzffvXhQM@cluster0.qe6izo7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // EVERY ROUTE API IS STARTING FORM HERE.

    const dbName=client.db("Medisch")
    app.get("/", async (req, res) => {
      res.send(`this server is running on ${port} port`);
    });

    // handle banner.
    const bannerDb=dbName.collection("banners")
    app.post("/post_banner",async(req,res)=>{
      const data=req.body
      const result=await bannerDb.insertOne(data)
      res.send(result)
    })
    app.get("/get_banners",async(req,res)=>{
      const result=await bannerDb.find().toArray()
      res.send(result)
    })
    app.patch("/banner_update",async(req,res)=>{
      const {bannerId}=req.body
       
      const forAll={
        $set:{
          isActive:false
        }
      }
      const queryforOne={
        _id:new ObjectId(bannerId)
      }
      const forOne={
        $set:{
          isActive:true
        }
      }
      const updateAll= await bannerDb.updateMany({},forAll)
      const updateOne=await bannerDb.updateOne(queryforOne,forOne)
      res.send({updateAll,updateOne})
    })
    app.post("/delete_banner",async(req,res)=>{
      const id=req.body.id
      const query={_id:new ObjectId(id)}
      const result=await bannerDb.deleteOne(query)
      res.send(result)
    })





    // handle user
    const userDb=dbName.collection("users")
    app.post("/post_user",async(req,res)=>{
      const data=req.body
      const result=await userDb.insertOne(data)
      res.send(result)
    })
    app.get("/get_users",async(req,res)=>{
      const result=await userDb.find().sort({_id:-1}).toArray()
      res.send(result)
    })
    app.patch("/update_user",async(req,res)=>{
      const data=req.body
      const updatedoc={
        $set:{
          status:data.status
        }
      }
      const query={email:data.email}
      const result=await userDb.updateOne(query,updatedoc)
      res.send(result)

    })
    app.patch("/role_update",async(req,res)=>{
      const data=req.body
      const query={email:data.email}
      const updatedoc={
        $set:{
          role:"admin"
        }
      }
      const result=await userDb.updateOne(query,updatedoc)
      res.send(result)
    })




    // handle test.

    const testDb=dbName.collection("Test")
    app.post("/Add_test",async(req,res)=>{
      const data=req.body
      const result=await testDb.insertOne(data)
      res.send(result)
    })
    app.get("/get_test",async(req,res)=>{
      const result=await testDb.find().toArray()
      res.send(result)
    })
    app.post("/delete_test",async(req,res)=>{
      const id=req.body.id
      const query={_id:new ObjectId(id)}
      const result=await testDb.deleteOne(query)
      res.send(result)
    })
    app.patch("/update_test",async(req,res)=>{
      const id=new ObjectId(req.body.id)
      console.log(id)
    })



  





    // the end of apis.

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

// app listner.

app.listen(port, () =>
  console.log(`Server is running on ${"http://localhost:5000"}`)
);
