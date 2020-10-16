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
app.use(express.static('service'))
app.use(fileUpload());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));


//default setup
app.get('/',(req, res)=>{
    res.send({
        status: 200,
        message:'Server is running'
    })
})

//database connect
const uri = "mongodb+srv://creativeAgency:adgjmptw499@cluster0.oawso.mongodb.net/creative-agency?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });


//Routes setup
client.connect(err => {
    const reviewsCollection = client.db("creative-agency").collection("reviews");
    const ordersCollection = client.db("creative-agency").collection("orders");
    const servicesCollection = client.db("creative-agency").collection("services");
    const adminsCollection = client.db("creative-agency").collection("admins");
    console.log('db connect')

    /*************REVIEWS****************/
    //add review
    app.post('/addReviews',(req,res)=>{
        const review=req.body;
        reviewsCollection.insertOne(review)
        .then((result)=>{
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
        const service=req.body.service;
        const description=req.body.description;
       const newImg=file.data
        const encImg=newImg.toString('base64')
        const image={
            contentType:file.mimetype,
            size:file.size,
            img:Buffer.from(encImg,'base64')
        }
        servicesCollection.insertOne({image:image, description, service})
        .then(result=>{
            res.send(result.insertedCount>0)
        })
    })

    /*************ORDERS****************/
    //get loggedIn person orders by EMAIL
    app.post('/my-orders' , (req, res) => {
        ordersCollection.find({email: req.body.email})
            .toArray((err, documents) =>{
                res.send(documents);
            })
    })

    //get all orders
    app.get('/orders',(req,res)=>{
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
    app.patch('/update', (req,res)=>{
        ordersCollection.updateOne({_id : ObjectId(req.body.id)},{$set: { decision: req.body.decision}})
        .then(result =>{
            res.send(result.modifiedCount > 0)
        })
    })

    /*************ADMINS****************/
    //add admin
    app.post('/addAdmin',(req,res)=>{
        adminsCollection.insertOne(req.body)
        .then(result=>{
            res.send(result)
        })
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