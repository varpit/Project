const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const policies = require('./routes/policyRoute');
const roles = require('./routes/roleRoute');
const posts = require('./routes/postRoute');
const auth = require('./routes/authRoute');
const users = require('./routes/userRoute');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/policy', policies);
app.use('/role', roles);
app.use('/post', posts);
app.use('/auth', auth);
app.use('/users', users);


app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({
    success: false, 
    error: 'URL not found' 
   }); 
 });

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});