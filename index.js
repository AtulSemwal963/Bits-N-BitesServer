//https://dizzy-tick-capris.cyclic.app

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');


const app = express();
const uri = 'mongodb+srv://admin:admin@cluster0.gqk6mzn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const start = async () => {
    try {
        app.listen(3000, () => {
            console.log("Server Started");
        });

        app.get('/', async (req, res) => {
            try {
                res.send("Server Started")
            } catch (err) {
                console.log(err.message);
                res.status(500).json({ error: 'Server error' });
            }
        })

        app.get('/messmenu', async (req, res) => {
            try {
                const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                await client.connect();
                const coll = client.db('Bits-N-Bites').collection('MessMenu');
                const filter = {};
                const result = await coll.find(filter).toArray();
                await client.close();
                res.send(result);
            } catch (err) {
                console.log(err.message);
                res.status(500).json({ error: 'Server error' });
            }
        });

        app.get('/restoumenu', async (req, res) => {
            try {
                const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                await client.connect();
                const coll = client.db('Bits-N-Bites').collection('RestoUMenu');
                const filter = {};
                const result = await coll.find(filter).toArray();
                await client.close();
                res.send(result);
            } catch (err) {
                console.log(err.message);
                res.status(500).json({ error: 'Server error' });
            }
        });

        app.get('/tuckshopmenu', async (req, res) => {
            try {
                const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                await client.connect();
                const coll = client.db('Bits-N-Bites').collection('TuckShopMenu');
                const filter = {};
                const result = await coll.find(filter).toArray();
                await client.close();
                res.send(result);
            } catch (err) {
                console.log(err.message);
                res.status(500).json({ error: 'Server error' });
            }
        });
        app.post('/placeOrderRestoU', async (req, res) => {
          try {
            // Connect to the MongoDB database
            const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            await client.connect();
            const db = client.db("Bits-N-Bites"); // Replace "Bits-N-Bites" with your database name
            const collection = db.collection("RestoUMenu"); // Replace "RestoUMenu" with your collection name
        
            const order = req.body;
        
            for (const item of order.items) {
              const category = item.category;
              const itemName = item.item;
        
              // Find the document containing the ordered item
              const filter = { [category]: { $elemMatch: { item: itemName } } };
              const doc = await collection.findOne(filter);
        
              if (!doc) {
                throw new Error(`Item "${itemName}" not found in category "${category}"`);
              }
        
              const existingItem = doc[category].find(i => i.item === itemName);
              const newQuantity = existingItem.qty - item.qty;
        
              if (newQuantity < 0) {
                throw new Error(`Insufficient stock for item "${itemName}"`);
              }
        
              // Update the document with the reduced quantity
              await collection.updateOne(filter, { $set: { [`${category}.$.qty`]: newQuantity } });
            }
        
            res.send('Order placed successfully!');
          } catch (error) {
            console.error(error);
            res.status(500).send('Error placing order');
          } finally {
            // Close the MongoDB connection (optional, connection pool might handle it)
            await client.close();
          }
        });
        app.post('/placeOrderTuckShop', async (req, res) => {
          try {
            // Connect to the MongoDB database
            const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            await client.connect();
            const db = client.db("Bits-N-Bites"); // Replace "Bits-N-Bites" with your database name
            const collection = db.collection("TuckShopMenu"); // Replace "RestoUMenu" with your collection name
        
            const order = req.body;
        
            for (const item of order.items) {
              const category = item.category;
              const itemName = item.item;
        
              // Find the document containing the ordered item
              const filter = { [category]: { $elemMatch: { item: itemName } } };
              const doc = await collection.findOne(filter);
        
              if (!doc) {
                throw new Error(`Item "${itemName}" not found in category "${category}"`);
              }
        
              const existingItem = doc[category].find(i => i.item === itemName);
              const newQuantity = existingItem.qty - item.qty;
        
              if (newQuantity < 0) {
                throw new Error(`Insufficient stock for item "${itemName}"`);
              }
        
              // Update the document with the reduced quantity
              await collection.updateOne(filter, { $set: { [`${category}.$.qty`]: newQuantity } });
            }
        
            res.send('Order placed successfully!');
          } catch (error) {
            console.error(error);
            res.status(500).send('Error placing order');
          } finally {
            // Close the MongoDB connection (optional, connection pool might handle it)
            await client.close();
          }
        });

          app.post('/accounts', async (req, res) => {
            try {
              const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
              await client.connect();
              const coll = client.db('Bits-N-Bites').collection('Accounts');
      
              // Extract umail and password from request body
              const { umail, password } = req.body;
      
              // Check if umail contains the correct university mail domain
              if (!umail.includes('@chitkarauniversity.edu.in')) {
                return res.status(203).json({ message: 'Invalid university mail' });
              }
      
              // Find the existing account
              const existingAccount = await coll.findOne({ umail });
      
              if (existingAccount) {
                // Check if the provided password matches the password stored in the database
                if (existingAccount.password === password) {
                  // If password matches, send confirmation message
                  res.status(200).json({ message: 'User logged in successfully' });
                } else {
                  // If password doesn't match, send error message
                  res.status(202).json({ message: 'Incorrect password' });
                }
              } else {
                // If account doesn't exist, create new document with umail and password
                const balance= 0;
                const loggedIn= true;
                await coll.insertOne({ umail, password, balance, loggedIn });
      
                // Send success message
                res.status(201).json({ message: 'Account created successfully' });
      
                // Send email to the user
               
      
                
              }
            } catch (error) {
              // Handle errors
              console.error('Error creating account:', error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });
          app.post('/addbalance', async (req, res) => {
            try {
              const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
              await client.connect();
              const coll = client.db('Bits-N-Bites').collection('Accounts');
          
              // Extract umail and balance from request body
              const { umail, balance } = req.body;
          
              // Find the user account
              const userAccount = await coll.findOne({ umail });
          
              if (!userAccount) {
                return res.status(404).json({ message: 'User account not found' });
              }
          
              // Update the balance
              await coll.updateOne({ umail }, { $inc: { balance: parseInt(balance) } });
          
              // Send success message
              res.status(200).json({ message: 'Balance added successfully' });
            } catch (error) {
              // Handle errors
              console.error('Error adding balance:', error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });
          app.post('/balance', async (req, res) => {
            try {
              const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
              await client.connect();
              const coll = client.db('Bits-N-Bites').collection('Accounts');
              
              // Extract umail from request body
              const { umail } = req.body;
              
              // Find the account by umail
              const account = await coll.findOne({ umail });
          
              if (!account) {
                return res.status(404).json({ message: 'Account not found' });
              }
          
              // Return the balance
              res.status(200).json({ balance: account.balance });
            } catch (error) {
              console.error('Error checking balance:', error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });
      
          // Other routes...
      
        } catch (err) {
          console.log(err.message);
        }
      }
       

start();