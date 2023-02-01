const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid){
            uploadError = null;
        }
        cb(uploadError,'public/uploads')
    },
    filename: function(req, file, cb) {
        let fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        fileName = fileName.replace(`.${extension}`,'');
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

// router.get(`/`, async (req, res) =>{
//     const productList = await Product.find().populate('category').select('name image category id price countInStock dateCreated');
//     //const productList = await Product.find().select('name image -_id');

//     if(!productList) {
//         res.status(500).json({success: false})
//     } 
//     res.send(productList);
// })

router.get(`/`, async (req, res) =>{
    //product list with category filter or without category filter
    //localhost:3000/api/v1/products?categories=12354,254612
    let filter = {};    
    if(req.query.categories){
        console.log(req.query.categories.split(','))
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get('/:id', async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async(req, res) =>{
    console.log(req.body);
    let category;
    try{
        category = await Category.findById(req.body.category);
    }catch(e){
        console.log(e);
    }
    
    if(!category){
        return res.status(400).send('Invalid Category')
    }

    if(!req.file.filename){
        return res.status(400).send('Invalid Image')    
    }

    const fileName = req.file.filename;
    const basePath = `${ req.protocol }://${ req.get('host') }/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    try{
        product = await product.save();
    }catch (e) {
        console.error(e);
    } 
    if(!product){
        return res.status(500).send('The product can not be created');
    }
    return res.status(200).send(product);
})

router.put('/:id',uploadOptions.single('image'),async(req, res)=>{
    if(!mongoose.isValidObjectId(req.body.category)){
        return res.status(400).send('Invalid Category Id')
    }
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    let category;
    try{
        category = await Category.findById(req.body.category);
    }catch(e){
        console.log(e);
    }
    
    if(!category){
        return res.status(400).send('Invalid Category')
    } 

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid Product !');

    const file = req.file;
    let imagepath;

    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`
    }else{
        imagepath = product.image;
    }


    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {new: true}
    )
    if(!updatedProduct)
        return res.status(500).send('Product can not be updated !')
    res.status(200).send(updatedProduct);
})

router.delete('/:id',(req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success: true, mesg: 'the product is deleted'})
        }else{
            return res.status(404).json({success: false, mesg: 'product not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    });
})

router.get('/get/count', async (req, res) =>{
    const productCount = await Product.countDocuments();
    
    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})

router.get('/get/featured/:count', async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count);
    
    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})

router.put('/gallery-images/:id', uploadOptions.array('images',10), async(req, res)=>{
        console.log(req.params.id);
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).send('Invalid Product Id')
        }
        const files = req.files;
        let imagesPaths = [];
        if(files){
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            files.map((file)=>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            {new: true}
        )

        if(!product)
            return res.status(500).send('Product can not be updated !')
        res.status(200).send(product);
    }
)

module.exports = router;