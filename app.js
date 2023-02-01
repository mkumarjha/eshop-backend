const express = require('express')
const app = express();
const morgan = require("morgan")
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helpers/jwt')

const errorHandler = require('./helpers/error-handler')

require('dotenv/config')

app.use(cors());
app.options('*',cors());

// middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//Routers
const productsRoutes = require('./routers/products')
const categoryRoutes = require('./routers/categories')
const usersRoutes = require('./routers/users')
const ordersRoutes = require('./routers/orders')

const api = process.env.API_URL;

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);


mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(()=>{
    console.log("Database connection is ready")
})
.catch((err)=>{
    console.log(err)
})

app.listen(3000,()=>{
    console.log("server is running on http://localhost:3000");
})