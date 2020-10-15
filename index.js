//init code
require('dotenv').config()
const express=require('express');
const mongodb=require('mongodb');
const cors=require('cors');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const ObjectId=require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const fileUpload =require('express-fileupload')

//middleware setup
const app=express()
app.use(fileUpload());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

//database connect
const uri = "mongodb+srv://creativeAgency:adgjmptw499@cluster0.oawso.mongodb.net/creative-agency?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });

//default setup
app.all('/',(req, res)=>{
    res.send({
        status: 200,
        message:'Server is running'
    })
})

//Routes setup
client.connect(err => {
    const reviewsCollection = client.db("creative-agency").collection("reviews");
    const ordersCollection = client.db("creative-agency").collection("orders");
    const servicesCollection = client.db("creative-agency").collection("services");
    const adminsCollection = client.db("creative-agency").collection("admins");

    /*************REVIEWS****************/
    //add review
    app.post('addReviews',(req,res)=>{
        const review=req.body;
        reviewsCollection.insertOne(review).then((result)=>{
            res.send(result);
        })
    })

    //see all reviews
    app.get('/reviews',(req,res)=>{
        reviewsCollection.find().toArray((err,documents)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents)
            }
        })
    })

    /*************SERVICES****************/
    //get service by ID
    app.get('/services/:id',(req,res)=>{
        servicesCollection.find({_id:ObjectId(req.params.id)})
        .toArray((err,documents)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents[0])
            }
        })
    })

    //get all services
    app.get('/services',(req,res)=>{
        servicesCollection.find().toArray((err,documents)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents)
            }
        })
    })

    //Add service
    app.post('/addService',(req,res)=>{
        const file=req.files.file;
        const title=req.body.title;
        const description=req.body.description;
        const newImg=file.data
        const encImg=newImg.toString('base64')
        const image={
            contentType:file.mimetype,
            size:file.size,
            img:Buffer.from(encImg,'base64')
        }
        servicesCollection.insertOne({image, description, title})
        .then(result=>{
            res.send(result.insertedCount>0)
        })
    })

    /*************ORDERS****************/
    //get loggedIn person orders by EMAIL
    app.get('my-orders/:email',(req,res)=>{
        ordersCollection.find({ email:req.params.email})
        .toArray((err,documents)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents)
            }
        })
    })

    //get all orders
    app.get('/order',(req,res)=>{
        ordersCollection.find().toArray((err,documents)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents)
            }
        })
    })

    //add order
    app.post('/addOrder',(req, res)=>{
        const order =req.body;
        ordersCollection.insertOne(order).then((result)=>{
            res.send(result);
        })
    })

    //update order
    app.put('/update',(req,res)=>{
        const id=req.body.id;
        ordersCollection.updateOne({_id:ObjectId(id)},{$set:{decision:req.body.decision}},(req, res)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents)
            }
        })
    })

    /*************ADMINS****************/
    //add admin
    app.post('/addAdmin',(req,res)=>{
        adminsCollection.insertOne({admin:req.body.admin})
        .then(result=>{
            res.send(result.insertedCount>0)
        })
        .catch(err=>console.log(err))
    })

    //get a admin
    app.get('/admin/:email',(req, res)=>{
        adminsCollection.find({email:req.params.email})
        .toArray((err,documents)=>{
            if(err){
                console.log(err);
                res.status(500).send({
                    message: err
                })
            } else {
                res.send(documents.length>0)
            }
        })
    })
});

const PORT =process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log('listening on port 5000')
})