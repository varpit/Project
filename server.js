const express = require("express");
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: './config/config.env'});
const connectDB = require('./config/db');

connectDB();
// Route files
const policy = require('./Routes/policyRouter');

const app = express();

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/', policy);



const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
   res.status(404).json({ 
     error: 'URL not found' 
    }) 
  });

app.listen(PORT, console.log(`Server is running ${process.env.NODE_ENV} mode on port ${PORT}`));
