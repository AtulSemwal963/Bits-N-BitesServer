const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = 'mongodb+srv://admin:admin@cluster0.gqk6mzn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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

    } catch (err) {
        console.log(err.message);
    }

    
    
}

start();