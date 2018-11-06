// SET DEPENDENCIES ------------------------------------------------------------

const Sequelize = require('sequelize');
const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const app = express();

const bodyParser = require('body-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store)

// BCRYPT PASSWORD -------------------------------------------------------------

const bcrypt = require('bcrypt');

const saltRounds = 10;
//
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

// CONFIG DEPENDENCIES ---------------------------------------------------------

const sequelize = new Sequelize('conorblogapp', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})

// CONNECT WITH TEMPLATE ENGINE FOLDER -----------------------------------------

app.set('views', './views');
app.set('view engine', 'ejs');

// SET UP SESSION --------------------------------------------------------------

app.use(session({
  store: new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000
  }),
  secret: "any string",
  saveUninitialized: true,
  resave: false
}))

// CONNECT WITH PUBLIC FOLDER --------------------------------------------------

app.use(express.static('./public'));

// SET UP BODY PARSER ----------------------------------------------------------

app.use(bodyParser.urlencoded({extended: true}));

//MODELS DEFINITION ------------------------------------------------------------

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
        unique: false,
    },
  },   {
      timestamps: false
    })

    const Post = sequelize.define('posts', {
      username: {
          type: Sequelize.STRING,
          allowNull: false
      },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        body: {
            type: Sequelize.STRING,
            allowNull: false
        },
    },  {
       timestamps: false
     })

    const Comments = sequelize.define('comments', {
        body: {
            type: Sequelize.STRING,
            allowNull: false
        },
    },   {
        timestamps: false
      })

// TABLES RELATIONSHIP/ASSOCIATION ---------------------------------------------
    User.hasMany(Post, { foreignKey: { allowNull: false } });
    Post.belongsTo(User, { foreignKey: { allowNull: false } });
    Comments.belongsTo(Post, { foreignKey: { allowNull: false } });
    Comments.belongsTo(User, { foreignKey: { allowNull: false } });

// ROUTING----------------------------------------------------------------------

// 01: HOME PAGE----------------------------------------------------------------

app.get('/', (req, res) => {
    var user = req.session.user
    res.render('home', { loginFailed: false })
})

// 02: CHECKING FOR MATCHING USER INPUT DATA------------------------------------

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
  	}).then((user) =>{
          bcrypt.compare(password, user.password, function(err, result) {
            if (username !== null && result) {
              req.session.user = user;
              res.redirect('/profile');
            } else {
              console.log(err);
              res.send('Your password is incorrect');
            }
        });
  	})
  })

  // 03: LOG OUT ---------------------------------------------------------------

  app.get('/logout', (req,res)=>{
    req.session.destroy(function(error) {
  		if(error) {
  			throw error;
  		}
  		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
  	})
  })

  // 04: SIGN UP----------------------------------------------------------------

  app.get('/signup', (req, res) => {
  	res.render('signup');
  })

  app.post('/signup', (req,res) => {

    let inputusername = req.body.username
    let inputfirstname = req.body.firstname
    let inputlastname = req.body.lastname
    let inputemail = req.body.email
    let inputpassword = req.body.password
    let inputconfirmpassword = req.body.confirmpassword

    if (inputpassword !== inputconfirmpassword) {
      res.send('Your password does not match');
    } else {
    bcrypt.hash(inputpassword, saltRounds).then(hash => {
    User.create({
      username: inputusername,
      firstname: inputfirstname,
      lastname: inputlastname,
      email: inputemail,
      password: hash,
    })

    .then((user) => {
          req.session.user = user;
          res.redirect('/profile');
        });
      })
  }
})

  // 05: PROFILE ---------------------------------------------------------------

  app.get('/profile', (req, res)=> {

    const user = req.session.user;
    if(user != null){
    res.render('profile', {user: user})             // message: message
  }else{
      res.redirect('/')
  }
  })

  // 06: CREATE A POST ---------------------------------------------------------

  app.get('/createpost', (req,res)=>{
      res.render('createpost')
  })

  app.post('/createpost', (req, res) => {

      var username = req.body.post_username;
      var title = req.body.post_title;
      var body = req.body.post_content;
      var user = req.session.user;

      Post.create({
          username: username,
          title: title,
          body: body,
          userId: user.id
      })
          .then(() => {
              res.redirect('yourposts')
          })
          .catch((err)=>{
              console.log("ERROR " + err);
          });
  })

  app.get('/delete/:id', (req, res) => {
      Post.destroy({
          where: {
              id: req.params.id
          }
      })
      .then(() => {
          res.redirect('/yourposts')
      })
  })

 // 07: DISPLAY ALL OF YOUR POSTS ---------------------------------------------

  app.get('/yourposts', (req, res) => {
      let user = req.session.user;
      if (user == null) {
          res.redirect('/')

      } else {
          var userId = user.id
          Post.findAll({

              where: {
                  userId: userId
              },
              include: [{
                  model: User
              }]
          })
              .then((yourposts) => {
                  res.render('yourposts', { user: user, posts: yourposts });
              })
      }
  })

  // 08: DISPLAY ONE OF YOUR SPECIFIC POSTS -----------------------------------

  app.get('/yourspecificpost/:postId', (req, res) => {
      var postId = req.params.postId
      Post.findOne({
          where: {
              id: postId
          },
          include: [{
              mmodel: User
          }]
      })
          .then((yourspecificpost) => {
              res.render('yourspecificpost', { yourspecificpost: yourspecificpost });
          })
  })

 // 09: DISPLAY ALL POSTS ------------------------------------------------------

  app.get('/posts', (req,res)=>{//  /allposts is the form action where the GET/POST goes to
      Post.findAll({
          include:[{
              model: User
          }]
      })
      .then((allposts)=>{
          res.render('posts', {posts: allposts})
      })
  })

// 10: DISPLAY A SPECIFIC POST OF OTHER USERS ----------------------------------

  app.get('/post/:postId', (req, res) => {
      let postId = req.params.postId
      Post.findOne({
          where: {
              id: postId
          },
          include: [{
              model: User
          }]
      })
      .then((post)=>{
          Comments.findAll({
              where:{
                  postId: postId
              }
          })
          .then((comments) => {
              res.render('specificpost',{post: post, comments: comments})
          })
      })
  })

// 11: LEAVE COMMENTS ----------------------------------------------------------

  app.get('/comment/:postId', (req,res)=>{
      let postId = req.params.postId
      res.render('comments', {postId: postId})
  })

  app.post('/comment/:postId', (req,res)=>{
      let postId = req.params.postId
      let userId = req.session.user.id
      let inputComment = req.body.inputComment

   Comments.create({
       postId: postId,
       body: inputComment,
       userId: userId
   })
   .then((comment)=>{
       let postId = comment.postId
       res.redirect('/post/' + postId)
   })
  })

 // ENABLE SEQUELIZE.SYNC ------------------------------------------------------

sequelize.sync({force: false})

// CONFIGURE PORT - ------------------------------------------------------------

  app.listen(3016, () => {
      console.log('App is running on port 3016');
  })
