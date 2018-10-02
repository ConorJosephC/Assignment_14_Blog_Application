const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const sequelize = new Sequelize('blogapp', 'postgres', 'p0stgr3SQL', {
    host: 'localhost',
    dialect: 'postgres'
})

const app = express();
app.listen('3014', ()=>{console.log('We are live on port 3014')});

app.set('views', './views');
app.set('view engine', 'ejs');

// app.use(session({
//   secret: "any string",
//   saveUninitialized: true,
//   resave: false
// }))

app.use(bodyParser.urlencoded({extended: true}));

const User = sequelize.define('users',{
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    firstname: {
        type: Sequelize.STRING,
        unique: false
    },
    lastname: {
        type: Sequelize.STRING,
        unique: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        unique: false
    },
  })

    // {
    //   timestamps: false
    // }



// ROUTING

// HOME PAGE

app.get('/', (req, res) => {
	res.render('home');
})

app.post('/signup', (req,res)=>{
  User.create({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  })

  .then((user) => {
        req.session.user = user;
        res.redirect('/profile');
      })
})

//


// Users.hasMany(Messages);
// Messages.belongsTo(Users);

// Messages.hasMany(Commentary);
// Commentary.belongsTo(Messages);



sequelize.sync()
