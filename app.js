var multer = require('multer')
var zlib = require('zlib')
var cors = require('cors')
let fs = require('fs')
const path = require('path')
const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet =  require('helmet')
const mongoSantize = require('express-mongo-sanitize')
const xss =  require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const userRouter = require('./routes/userRoutes')
const AppError = require('./util/appError')
const errorController = require('./controller/errorController')
const viewRouter = require('./routes/viewRoutes')
const connectionRouter = require('./routes/connectionRoutes')


const app = express()

app.set('view engine' , 'ejs')

app.set('views' , path.join( __dirname , 'views'))


app.use(cors());
//multer
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage,
});


app.use(express.static( path.join( __dirname , 'public'))) //TO SERVE STATIC FILE

//set security HTTp header
app.use(helmet()) //->> put it first

//Add the following
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://cdnjs.cloudflare.com/ajax/libs/axios/0.27.2/axios.js",
    "https://js.stripe.com/v3/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js",
    "https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
];
const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
    
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "wss://0.peerjs.com"
    
];
const fontSrcUrls = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'","'unsafe-inline'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




//limit the number of request
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 *1000,
    message: 'Too many request...' 
})

app.use('/api',limiter) // --> this only apply limiter middleware to the /api route





//body parser from data in body to req.body-- cannot parse the file field
//in multi part form data
app.use(express.json({ limit : '10kb'})) //middleware
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser())



//Data sanitisation against NOSQL query injection and XSS
app.use(mongoSantize());//check out the req.body, req.param , req.query and remove the $ and .
app.use(xss())// -> remove the html tags from the input data

//handle the parameter pollution, remove duplicate
app.use(hpp({
    whitelist: ['duration' , 'ratingQuantity' , 'ratingAverages' , 'price']
}))

app.use( compression()) //->only for text

if(process.env.NODE_ENV === 'dev'){
    app.use(morgan('dev'))
}

app.post('/api/v1/test', (req, res)=>{
  res.status(200).json({
      status:'success',
      data:"Working Fine."
  })
})

app.post("/compress",  upload.single('file'),async (req, res) => {
  // console.log(req)
  // res.status(200).json({
  //   status:'success',
  //   data:"Working Fine."
// })
  try {
    const destination = `compressed/${req.file.originalname}.gz`;
    let fileBuffer = req.file.buffer;
    await zlib.gzip(fileBuffer, (err, response) => {
      if (err) {
        console.log(err);
      }
      // res.status( 200).json({
      //     status:'success',
      //     data: response
      // })
      fs.writeFile(path.join(__dirname, destination), response, (err, data) => {
        if (err) {
          console.log(err);
        }
        res.download(path.join(__dirname, destination));
      });
    });
  } catch (err) {
    
    res.status(404).json({
      status: "fail",
      err
    })
  }
});

app.use('/' , viewRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/connection', connectionRouter)





app.all('*' , (req , res,next) => {
    
    next(new AppError('Could not find the route' , 404))
})

app.use( errorController)


module.exports = app
