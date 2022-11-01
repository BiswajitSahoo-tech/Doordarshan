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
    "https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"
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

app.use('/' , viewRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/connection', connectionRouter)


app.all('*' , (req , res,next) => {
    
    next(new AppError('Could not find the route' , 404))
})

app.use( errorController)


module.exports = app
