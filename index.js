const express = require("express");
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(
  cors({
    origin: ["http://localhost:5173","http://192.168.1.4:5173","https://6565dd1cad3d816d1934d906--effervescent-sorbet-8fa644.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
    // JWT TOKEN API .
    app.post("/jwt_token", async (req, res) => {
      const email = req.body.email;
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true, secure: true });
      res.send({ success: true });
    });
    //

    // stripe payment.

    app.post("/create-payment-intent", async (req, res) => {
      let price = req.body.price - req.body.discount;
      price = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ secret: paymentIntent.client_secret });
    });

    // EVERY ROUTE API IS STARTING FORM HERE.

    const dbName = client.db("Medisch");
    app.get("/", async (req, res) => {
      res.send(`this server is running on ${port} port`);
    });

    // handle banner.
    const bannerDb = dbName.collection("banners");
    app.post("/post_banner", async (req, res) => {
      const data = req.body;
      const result = await bannerDb.insertOne(data);
      res.send(result);
    });
    app.get("/get_banners", async (req, res) => {
      const result = await bannerDb.find().toArray();
      res.send(result);
    });
    app.patch("/banner_update", async (req, res) => {
      const { bannerId } = req.body;

      const forAll = {
        $set: {
          isActive: false,
        },
      };
      const queryforOne = {
        _id: new ObjectId(bannerId),
      };
      const forOne = {
        $set: {
          isActive: true,
        },
      };
      const updateAll = await bannerDb.updateMany({}, forAll);
      const updateOne = await bannerDb.updateOne(queryforOne, forOne);
      res.send({ updateAll, updateOne });
    });
    app.post("/delete_banner", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const result = await bannerDb.deleteOne(query);
      res.send(result);
    });
    app.get("/visibale_banner", async (req, res) => {
      const query = { isActive: true };
      const result = await bannerDb.findOne(query);
      res.send(result);
    });

    // handle user
    const userDb = dbName.collection("users");
    app.post("/post_user", async (req, res) => {
      const data = req.body;
      const result = await userDb.insertOne(data);
      res.send(result);
    });
    app.get("/get_users", async (req, res) => {
      const result = await userDb.find().sort({ _id: -1 }).toArray();
      res.send(result);
    });
    app.patch("/update_user", async (req, res) => {
      const data = req.body;
      const updatedoc = {
        $set: {
          status: data.status,
        },
      };
      const query = { email: data.email };
      const result = await userDb.updateOne(query, updatedoc);
      res.send(result);
    });
    app.patch("/role_update", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const updatedoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userDb.updateOne(query, updatedoc);
      res.send(result);
    });


    app.post("/single_userdata",async(req,res)=>{
      // const data=req.body.email
      // const query={email:data}
      const result =await userDb.find().toArray()
      res.send(result)
    })
    app.patch("/single_userUpdate",async(req,res)=>{
      const data=req.body
      const updatedoc={
        $set:{
          name:data.name,
          bloodGroup:data.bloodGorup,
          upazila:data.upazila,
          district:data.district

        }
      }
     const query={_id:new ObjectId(data.id)}
     const result= await userDb.updateOne(query,updatedoc)
     res.send(result)

    })
    
   
//  getting banner data.
app.get("/get_banner_data",async(req,res)=>{
  const recomandDb=dbName.collection("recomendation")
  const result=await recomandDb.find().toArray()
  res.send(result)
})



    // handle test.

    const testDb = dbName.collection("Test");
    app.post("/Add_test", async (req, res) => {
      const data = req.body;
      const result = await testDb.insertOne(data);
      res.send(result);
    });
    app.get("/get_test", async (req, res) => {
      const result = await testDb.find().toArray();
      res.send(result);
    });
    app.post("/delete_test", async (req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id) };
      const result = await testDb.deleteOne(query);
      res.send(result);
    });

    app.post("/update_test", async (req, res) => {
      const data = req.body;
      const { testName, price, imageUrl, details, date, slots, id } = data;
      const updatedoc = {
        $set: {
          testName: testName,
          price: price,
          imageUrl: imageUrl,
          details: details,
          date: date,
          slots: slots,
        },
      };

      const query = { _id: new ObjectId(id) };
      const result = await testDb.updateOne(query, updatedoc);
      res.send(result);
    });
    app.get("/Single_test", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await testDb.findOne(query);
      res.send(result);
    });
    app.post("/decrement_item_slots",async(req,res)=>{
      const id=req.body.id
      const query={_id:new ObjectId(id)}
      const modify={
        $inc:{slots:-1,reservation:1}
      }
      const result=await testDb.updateOne(query,modify)
      res.send(result)
    })


    // handle booked order.
const bookedDb=dbName.collection("Booked Service")
    app.post("/add_booked_item",async(req,res)=>{
      const data=req.body
      const result=await bookedDb.insertOne(data)
      res.send(result)

    })
    app.get("/booked_data",async(req,res)=>{
      const email=req.query.email
      const query={userEmail:email}
      const result=await bookedDb.find(query).sort({_id:-1}).toArray()
      res.send(result)
    })
    app.post("/delete_item",async(req,res)=>{
      const id=req.body.id
      const query={_id:new ObjectId(id)}
      const result=await bookedDb.deleteOne(query)
      res.send(result)
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
