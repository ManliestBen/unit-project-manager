import 'dotenv/config.js'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import createError from 'http-errors'
import session from 'express-session'
import logger from 'morgan'
import methodOverride from 'method-override'
import passport from 'passport'
import { passUserToView, maintainGoogleToken } from "./middleware/middleware.js"

// connect to MongoDB with mongoose
import('./config/database.js')

// load passport
import('./config/passport.js')

// require routes
import { router as indexRouter } from './routes/index.js'
import { router as authRouter } from './routes/auth.js'
import { router as buildRouter } from "./routes/build.js"

// create the express app
const app = express()

// view engine setup
app.set(
  'views',
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'views')
)
app.set('view engine', 'ejs')

// middleware
app.use(methodOverride('_method'))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  express.static(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'public')
  )
)

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax',
    }
  })
)

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(passUserToView)
// app.use(maintainGoogleToken)

// router middleware
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use("/build", buildRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', {
    title: `🎊 ${err.status || 500} Error`,
    user: req.user ? req.user : null,
  })
})

export { app }



