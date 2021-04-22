let express = require('express');
let hbs = require('express-handlebars');
let bodyparser = require('body-parser');
let multer = require('multer');

let db = require('mongoose');




let userSchema = require('./model/userSchema');
let User = db.model ('user',userSchema,'users');

let productsSchema = require('./model/productSchema');
let Product = db.model('product', productsSchema, 'products');
db.connect('mongodb+srv://admin:21102000@cluster0-ctqe1.mongodb.net/test',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected')
}).catch((error) => {
    console.log('Error Connect')
});

let app = express();
app.use(bodyparser.urlencoded({extended: true}));

app.use(express.static('uploads'));
app.use('/css',express.static(__dirname+'/css'));
app.use('/images',express.static(__dirname+'/images'));
app.use('/vendor',express.static(__dirname+ '/vendor'));

app.engine('.hbs',hbs({extname:'hbs',defaultLayout: '',layoutsDir: ''}));
app.set('view engine','.hbs');
app.listen(4444);


app.get('/',function(req,res) {
    res.render('login')
})

app.get('/signup',function(req,res) {
    res.render('signup')
})
app.get('/forumUser',async (req,res) => {
    let user = await  User.find({}).lean();
    res.render('forum-users',{user: user});
});

app.get('/uploadProduct', async (req,res) => {
    let product = await Product.find({}).lean();
    res.render('add-product',{product: product});
});

// app.get('/addUser', async (req,res) => {
//     let user = await User.find({}).lean();
//     res.render('signup',{user: user});
// });



app.get('/forumProduct', async (req,res) => {
    let product = await Product.find({}).lean();
    res.render('list-product',{product: product});
});

app.get('/productManager', async (req,res) => {
    let product = await Product.find({}).lean();
    res.render('table-product',{product: product});
});

app.get('/deleteUser/:id', async (req,res) => {
    let user = await  User.findByIdAndDelete(req.params.id);
    res.redirect('/forumUser');
});
// Cho nay lam sao de lay ra cai id cua san pham xong chi can tim cai san pham co id do thoi.
app.get('/editProduct/:id', async (req,res) => {
    let product = await  Product.findOne({ _id: req.params.id});
    res.render('edit_product',{
        id: req.params.id,
        name: product.name,
        specie: product.specie,
        price: product.price,
        note: product.note,
        image:'./'+ product.image,

    })

});

app.get('/deleteProduct/:id', async (req,res) => {
    let product = await Product.findByIdAndDelete(req.params.id);
    res.redirect('/forumProduct');
});


//upload product

let multerConfig = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'./uploads');
    }, filename(req, file, cb) {
        cb(null,file.originalname);
    }
});

let uploadManyFiles = multer({storage: multerConfig, limits: {
        fileSize : 2 * 1024* 1024
    },
    fileFilter(req, file, cb) {
        const fileNameArr = file.originalname.split('.');
        const format = '.' + fileNameArr[fileNameArr.length - 1];
        switch (format) {
            case '.jpg':
                cb(null,true);
                break;
            default:
                cb(new Error(`File ${file.originalname} không đúng định dạng JPG hoặc JPEG.`),false);
                break;
        }
    }
}).single('image');

app.post('/upload', (req, res) => {
    uploadManyFiles(req,res, async (error) => {
        if(error){
            if(error instanceof  multer.MulterError){
                res.render('add-product',{isShow: true, alertMessage: 'Vượt quá số lượng file cho phép'});
            }else {
                res.render('add-product',{isShow: true, alertMessage: error.message});
            }
        }else  if(req.file.length <= 0){
            res.render('add-product',{isShow: true, alertMessage: 'Phải chọn ít nhất một file'})
        }
        else {
            try{
                let name = req.body.nameProduct;
                let price = req.body.priceProduct;
                let specie = req.body.specieProduct;
                let note = req.body.noteProduct;
                let image = req.file.path.split('\\')[1];
                await new Product({
                    name: name,
                    price: price,
                    image: './' +image,
                    specie: specie,
                    note: note
                }).save();
                console.log(image);
                let product = await  Product.find({}).lean();
                res.render('list-product',{isShow: true, alertMessage: 'Upload thành công',product: product});

            }catch (e) {
                let product = await  Product.find({}).lean();
                res.render('list-product',{isShow: true, alertMessage: e.message,product: product});
            }
        }
    })
});
app.post('/editProduct', (req, res) => {
    uploadManyFiles(req,res, async (error) => {
        if(error){
            if(error instanceof  multer.MulterError){
                res.render('list-product',{isShow: true, alertMessage: 'Vượt quá số lượng file cho phép'});
            }else {
                res.render('list-product',{isShow: true, alertMessage: error.message});
            }
        }else  if(req.file.length <= 0){
            res.render('list-product',{isShow: true, alertMessage: 'Phải chọn ít nhất một file'})
        }else {
           var id1 = req.body.id;
           var name = req.body.nameProduct;
           var specie = req.body.specieProduct;
           var price = req.body.priceProduct;
           var note = req.body.noteProduct;

           var image = req.file.path.split('\\')[1];

                try {
                    await Product.findByIdAndUpdate(id1,{
                        name:name,
                        specie: specie,
                        price: price,
                        note: note,
                        image: './' +image,
                    });
                    res.redirect('/forumProduct')
                }catch (e) {
                    res.send('Error'+ e.message)
                }
        }
    })
});

// sign up and sign in


app.post('/login', async (req,res) => {
    let sm = req.body.sm;
    let username = req.body.userName;
    let password = req.body.password;
    let confirmPassword = req.body.pass;


    if(sm == 'login') {
        let currentUser = await User.findOne({
            username: username,
            password: password,

        })
        if (currentUser == null) {
            res.render('login', {isShow: true, alertMessage: 'Sai tài khoản hoặc mật khẩu'})
        } else {
            res.render('table-product', {isShow: true, alertMessage: 'Login successful'})
        }
    }else if (sm == 'opensignup'){
        res.render('signup', {});
    }else  if(sm == 'signup'){

        // if(password.match(confirmPassword)){
        //     res.render('signup', {isShow: true, alertMessage: 'Mật khẩu không khớp'})
        //
        // }
        try {
            let user = new User({

                username: username,
                password: password,

            })
            await  user.save();
            res.render('login',{isShow: true, alertMessage: 'Đăng kí thành công'})
        }catch(e){
            res.render('signup', {isShow: true, alertMessage: e.message})
        }
    }
});





