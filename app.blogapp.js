const Sequelize = require('sequelize');
const express = require('express');
const ejs = require('ejs');
const session = require('express-session');

const bodyParser = require('body-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store)

// CONFIG DEPENDENCIES

const sequelize = new Sequelize('blogapp', 'postgres', 'p0stgr3SQL', {
    host: 'localhost',
    dialect: 'postgres'
})

const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(session({
  store: new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
    expiration: 24 * 60 * 60 * 1000 // The maximum age (in milliseconds) of a valid session.
  }),
  secret: "any string",
  saveUninitialized: true,
  resave: false
}))

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));




//MODELS DEFINITION

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
  },   {
      timestamps: false
    })



const Message = sequelize.define('messages', {
  title:{
    type: Sequelize.STRING,
  },
  body:{
    type: Sequelize.STRING,
  }
},   {
    timestamps: false
  })


// TABLES RELATIONSHIP/ASSOCIATION

User.hasMany(Message);
Message.belongsTo(User);

// Messages.hasMany(Commentary);
// Commentary.belongsTo(Messages);


// ROUTING-------------------------------

// 01: HOME PAGE-------------------------

app.get('/', (req, res) => {
	res.render('home')
});

// 02: CHECKING FOR MATCHING USER INPUT DATA------------

app.post('/', function (req, res) {

    let username = req.body.username;
    let password = req.body.password;

    if(username.length === 0) {
      res.redirect('/?message=' + encodeURIComponent("Please fill in your correct username."));
      return;
    }

    if(password.length === 0) {
      res.redirect('/?message=' + encodeURIComponent("Please fill in your password."));
      return;
    }

    User.findOne({
  		where: {
  			username: username
  		}
  	}).then(function(user){

  			if(user!== null && password === user.password){
          console.log("user info" + JSON.stringify(user.dataValues));
          req.session.user = user;
  				res.redirect('/profile');     // /myprofile
  			} else {
  				res.redirect('/?message=' + encodeURIComponent('Invalid email or password.'));
  			}
  	});
  });

app.get('/logout', (req,res)=>{
  req.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
})



// 03: SIGNUP-------------------------------------------

app.get('/signup', (req, res) => {
	res.render('signup');
})

app.post('/signup', (req,res) => {

  let inputusername = req.body.username
  let inputfirstname = req.body.firstname
  let inputlastname = req.body.lastname
  let inputemail = req.body.email
  let inputpassword = req.body.password

  User.create({
    username: inputusername,
    firstname: inputfirstname,
    lastname: inputlastname,
    email: inputemail,
    password: inputpassword
  })

  .then((user) => {
        req.session.user = user;
        res.redirect('/profile');
      });
})

app.get('/profile', (req, res)=> {
  const user = req.session.user
  // console.log('User info '+ user)
  res.render('profile', {user: user})
})

// 04: POST TO YOUR BLOG----------------

app.get('/post_to_your_blog', function (req, res) {

  const user = req.session.user;

  if (user === undefined) {
    res.redirect('/?message=' + encodeURIComponent("Please log in to post a message."));
  } else {
    res.render("post_to_your_blog");
  }
});

app.post('/post_to_your_blog', function(req, res) {

    var inputUsername = req.body.username;
    var inputTitle = req.body.title;
    var inputBody = req.body.yourmessage;
    console.log(req.body)
    User.findOne({
      where: {
          username: inputUsername        // req.session.user = user;                        //
      }
    })
    .then(function(user){
      console.log(user)
      return user.createMessage({
        title: inputTitle,
        body: inputBody,
      })
    })
    .then ( user => {
      res.redirect('/');                //${message.id}`
    })
});

// POST TO YOUR BLOG-----------------------

// app.get('/post_to_your_blog', function(req, res){
//   res.render('post_to_your_blog')
// });


// DISPLAYING ALL MESSAGES------------------


app.get('/show_all_posts', function(req,res){
  Message.findAll({
    include: [{
    model: User
  }]
  })
  .then((messages)=>{
    console.log(messages)
    res.render('show_all_posts',{messages: messages})
  })
})



// app.get('/:id', function(req,res){
//   Message.findAll()
//   .then((messages)=>{
//     res.render('post_to_your_blog', {messages: messages})
//   })
// })


// app.get('/:id', function(req,res){
//   Message.findAll({
//     include: [{
//       model: User
//     }]
//   })
//   .then((messages)=>{
//     res.render('all_user_messages', {messagesList: messages})
//   })
// })



sequelize.sync()

app.listen(3014, function(){
  console.log("We are live on port 3014")
})

// app.listen('3014', ()=>{console.log('We are live on port 3014')});   (above models definition)
