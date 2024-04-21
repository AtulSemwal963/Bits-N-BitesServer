const express = require('express');
const { MongoClient } = require('mongodb');
const nodemailer= require('nodemailer')
const PDFDocument= require('pdfkit')
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const uri = 'mongodb+srv://user:1234@cluster0.fz8cxrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
 

async function startServer() {
    try {
        // Connect to the MongoDB client
        await client.connect();
        console.log("Connected successfully to MongoDB");

        // Confirm the server is listening for requests
       

        // Define API endpoints
        app.get('/', (req, res) => {
            res.send("Server is running");
        });

        // Additional endpoints...

        // Place additional routes here

        // Don't forget to handle database disconnection on process termination
        process.on('SIGINT', async () => {
            await client.close();
            process.exit();
        });

    } catch (error) {
        console.error('Unable to connect to database:', error);
        process.exit(1);
    }
}

startServer();

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
                res.send(`Item "${itemName}" not found in category "${category}"`);
              }
        
              const existingItem = doc[category].find(i => i.item === itemName);
              const newQuantity = existingItem.qty - item.qty;
        
              if (newQuantity < 0) {
                res.status(500).send(`Insufficient stock for item "${itemName}"`);
              }
        
              // Update the document with the reduced quantity
              await collection.updateOne(filter, { $set: { [`${category}.$.qty`]: newQuantity } });
            }
        
            res.send('Order placed successfully!');
          } catch (error) {
            console.error(error);
            res.status(500).send('Error placing order');
          } 
        });
        app.post('/placeOrderTuckShop', async (req, res) => {
          try {
            // Connect to the MongoDB database
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
                res.status(500).send(`Item "${itemName}" not found in category "${category}"`);
              }
        
              const existingItem = doc[category].find(i => i.item === itemName);
              const newQuantity = existingItem.qty - item.qty;
        
              if (newQuantity < 0) {
                res.status(500).send(`Insufficient stock for item "${itemName}"`);
              }
        
              // Update the document with the reduced quantity
              await collection.updateOne(filter, { $set: { [`${category}.$.qty`]: newQuantity } });
            }
        
            res.send('Order placed successfully!');
          } catch (error) {
            console.error(error);
            res.status(500).send('Error placing order');
          } 
        });

          app.post('/accounts', async (req, res) => {
            try {
              const coll = client.db('Bits-N-Bites').collection('Accounts');
      
              // Extract umail and password from request body
              const { umail, password } = req.body;
      
              // Check if umail contains the correct university mail domain
              if (!umail.includes('@chitkarauniversity.edu.in')) {
                return res.status(500).send({ message: 'Invalid university mail' });
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
                  res.status(500).send({ message: 'Incorrect password' });
                }
              } else {
                // If account doesn't exist, create new document with umail and password
                const balance= 0;
                const loggedIn= true;
                await coll.insertOne({ umail, password, balance, loggedIn });
      
                // Send success message
                res.status(200).json({ message: 'Account created successfully' });
      
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
          app.post('/send-email', async (req, res) => {
            try {
              // Extract user email from request body
              const { userEmail } = req.body;
          
              // Create a Nodemailer transporter object using SMTP transport
              const transporter = nodemailer.createTransport({
                service: 'gmail', // Example: Gmail, SMTP service you want to use
                auth: {
                  user: 'bitsnbiteschitkarauniversity@gmail.com', // Your email address
                  pass: 'helt gscf ryqh tvyt' // Your email password or an app password
                }
              });
          
              // Email message options
              const mailOptions = {
                from: 'bitsnbiteschitkarauniversity@gmail.com', // Sender email address
                to: userEmail, // Recipient email address
                subject: 'Subject of the Email', // Subject line
                text: 'This is the body of the email.' // Plain text body
              };
          
              // Send mail with defined transport object
              await transporter.sendMail(mailOptions);
          
              // Response if email sent successfully
              res.status(200).json({ message: 'Email sent successfully' });
            } catch (error) {
              // Response if there's an error sending the email
              console.error('Error sending email:', error);
              res.status(500).json({ error: 'Failed to send email' });
            }
          });
          app.post('/send-order-summary', async (req, res) => {
            try {
              // Extract user email and order details from request body
              const { userEmail, order } = req.body;
          
              // Create a PDF document
              const doc = new PDFDocument();
              
              doc.image('icon.png',250,51,{width: 120, height: 120});
              doc.image('qrCode.png',400,doc.page.height-250,{width: 180, height: 180});
              doc.moveDown(8);
              
              doc.pipe(fs.createWriteStream('order_summary.pdf')); // Pipe PDF output to a file
              
              // Add order summary to the PDF
              doc.fontSize(30).font('Times-Roman').text('Order Summary', { align: 'center' }).moveDown(2);
              doc.lineCap('butt').lineWidth(4).dash(5)
              .moveTo((doc.page.width/2)+220, 230)
              .lineTo(70, 230)
              .fillAndStroke("#BF1A2F", "#BF1A2F");

              doc.lineCap('round').lineWidth(50)
   .moveTo(0, 0)
   .lineTo(doc.page.width, 0)
   .fillAndStroke("#BF1A2F", "#BF1A2F");
   doc.lineCap('round').lineWidth(50)
              .moveTo(0, doc.page.height-20)
              .lineTo(doc.page.width, doc.page.height-20)
              .fillAndStroke("#BF1A2F", "#BF1A2F");

              order.items.forEach(item => {
                doc.fontSize(18).fillColor('black').text(`${item.qty} x ${item.item}`);
              });
                         
              // End the PDF document
              doc.end();
          
              // Create a Nodemailer transporter object using SMTP transport
              const transporter = nodemailer.createTransport({
                service: 'Gmail', // Example: Gmail, SMTP service you want to use
                auth: {
                  user: 'bitsnbiteschitkarauniversity@gmail.com', // Your email address
                  pass: 'helt gscf ryqh tvyt' // Your email password or an app password
                }
              });
          
              // Construct the email message
                const name =  userEmail.substring(0,  userEmail.indexOf(".")).toLowerCase();
                 const ID = name.charAt(0).toUpperCase() + name.slice(1);
              const mailOptions = {
                from: 'your-email@gmail.com', // Sender email address
                to: userEmail, // Recipient email address
                subject: ID+":Order Summary", // Subject line
                html: '<p>Thank you for your order!</p><p>Please find attached the order summary.</p><p>Open the file attached below and verify the QR code with the store keeper.</p>',
                attachments: [
                  {
                    filename: ID+'_'+Date.now()+'_order_summary.pdf', // Filename for the attachment
                    path: 'order_summary.pdf' // Path to the PDF file
                  }
                ]
              };
          
              // Send mail with defined transport object
              await transporter.sendMail(mailOptions);
          
              // Delete the PDF file after sending the email
              fs.unlinkSync('order_summary.pdf');
          
              // Response if email sent successfully
              res.status(200).json({ message: 'Email sent successfully' });
            } catch (error) {
              // Response if there's an error sending the email
              console.error('Error sending email:', error);
              res.status(500).json({ error: 'Failed to send email' });
            }
          })
      
        } catch (err) {
          console.log(err.message);
        }
      }
       

start();
