const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const appRoutes = require('./routes/authRoutes');
const {requireAuth, checkUser} = require('./middleware/authMiddleware');
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// View engine
app.set('view engine', 'ejs');

// MongoDB URI
const uri = "mongodb+srv://gandharvaliduser:validpassword@cluster0.tvooebk.mongodb.net/node-auth";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Connect to MongoDB using Mongoose
mongoose.connect(uri)
  .then((result) => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => console.log('Server is running on port 3000'));
  })
  .catch((err) => console.log(err));

// Routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies',requireAuth ,(req, res) => res.render('smoothies'));
app.use(appRoutes);

// Optionally set strictQuery
//mongoose.set('strictQuery', false); // You can also set this to true based on your preference
