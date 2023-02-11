require('dotenv').config();
const express = require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose  = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);


app.use(session({
  secret : "our little secret",
  resave : false,
  saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());





mongoose.connect('mongodb://127.0.0.1:27017/mongoDB',
{             // connecting mongoose with node
 useNewUrlParser: true,

 useUnifiedTopology: true
}, function(err){
 if(err){
   console.log(err);
 }
 else{
   console.log("successfully connected to database.");
 }
}
);
// mongoose.set('useCreateIndex', true);

// mongoose.set('strictQuery', false);



const usersSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

const WorkerSchema = new mongoose.Schema({
  name : String,
  email: String,
  mobile: String,
  skills : String,
  address: String
  // email : String
  
  
});

const ClientSchema = new mongoose.Schema({
  name: String,
  email : String,
  mobile : String,
  address : String

});

usersSchema.plugin(passportLocalMongoose);
usersSchema.plugin(findOrCreate);



// usersSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']})





// creating model(collection)
const Worker = mongoose.model('Worker', usersSchema);
const WorkerProfile = mongoose.model('WorkerProfile', WorkerSchema);
const ClientProfile = mongoose.model('ClientProfile', ClientSchema);


passport.use(Worker.createStrategy());
const Client = mongoose.model('Client', usersSchema);


passport.use(Client.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/Secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    Worker.findOrCreate({ googleId: profile.id }, function (err, Worker) {
      return cb(err, Worker);
    });
  }
));

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/Secrets"
},
function(accessToken, refreshToken, profile, cb) {
  Client.findOrCreate({ googleId: profile.id }, function (err, Worker) {
    return cb(err, Worker);
  });
}
));

app.get('/', function(req, res){
  res.render('o')
});

app.get('/home', function(req, res){
  res.render('home')
});

app.get('/C-home', function(req, res){
  res.render('C-home')
})
app.get('/login', function(req, res){
  res.render('login')
});
app.get('/register', function(req, res){
  res.render('register')
});
app.get('/C-login', function(req, res){
  res.render('C-login')
});
app.get('/C-register', function(req, res){
  res.render('C-register')
});
app.get('/form', function(req, res){
  res.render('form')
});
app.get('/worker', function(req, res){
  res.render('worker')
});
app.get('/C-form', function(req, res){
  res.render('C-form')
});
// app.get('/secrets', function(req, res){
//   Worker.find({'secret': {$ne: null}}, function(err, foundUser){
//     // {$in: ['some title', 'some other title']}
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         res.render('secrets', {userWithSecret: foundUser});
//       }
//     }
//   })
// });
// app.get('/secrets', function(req, res){
//   Client.find({'secret': {$ne: null}}, function(err, foundUser){
//     // {$in: ['some title', 'some other title']}
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         res.render('secrets', {userWithSecret: foundUser});
//       }
//     }
//   })
// });
app.get('/logout', function(req, res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/')
    }
  })

});
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get('/submit', function(req, res){
  if(req.isAuthenticated()){
    res.render('submit');
  }else{
    res.redirect('/login');
  }
});
// app.post('/submit', function(req, res){
//   const submittedSecret = req.body.secret
//   Worker.findById(req.user.id, function(err, foundUser){
//     if(err){
//       console.log(err);
//     }else{
//     if(foundUser){
//       foundUser.secret = submittedSecret
//       foundUser.save(function(){

//         res.redirect('/secrets')
//       });
//     }
//     }
//   });
// });
// app.post('/submit', function(req, res){
//   const submittedSecret = req.body.secret
//   Client.findById(req.user.id, function(err, foundUser){
//     if(err){
//       console.log(err);
//     }else{
//     if(foundUser){
//       foundUser.secret = submittedSecret
//       foundUser.save(function(){

//         res.redirect('/secrets')
//       });
//     }
//     }
//   });
// });







app.post('/register', function(req, res){
  // const username = req.body.username
  // // const password = md5(req.body.password)
  // const password = req.body.password
  // bcrypt.hash(password, saltRounds, function(err, hash){
  //   if(!err){
  //     const newUser = new users({
  //       email : username,
  //       password : hash
  //
  //     });
  //     newUser.save(function(err){
  //       if(err){
  //         console.log(err);
  //       }else{
  //         res.render('secrets')
  //       }
  //     });
  //   }
  // });
 var workerUserName;
 Worker.register({username: req.body.username}, req.body.password, function(err){
 workerUserName = req.body.username;
//  console.log(workerUserName);
   if(err){
     console.log(err);
     res.redirect('/register');
   }else{
    res.redirect('/form');
    //  passport.authenticate("local")(req, res, function(){
       
    //  });
   }
 });
});

app.post("/form", function (req, res) {
  
  var WorkerName = req.body.name;
  var email = req.body.email;
  var WorkerMobile = req.body.phone; 
  var address = req.body.address;
  var skills = req.body.skills;

  res.render('worker', 
  {
  name : WorkerName,
  phone : WorkerMobile,
  skills:skills,
  address : address,
  email: email
}
);


const newWorker = new WorkerProfile({

          name : WorkerName,
          email: email,
          mobile : WorkerMobile,
           skills:skills,
           address: address,
          //  email: workerUserName
  
      });
      newWorker.save(function(err){
        if(err){
          console.log(err);
        }else{
          res.render('worker')
        }
      });
});






app.post('/login', function(req, res){
//   const username = req.body.username
//   // const password = md5(req.body.password)
//   const password = req.body.password
//   users.findOne({email: username}, function(err , foundUser){
//     if(err){
//       res.send('Username or password incorrect')
//     }else{
//       bcrypt.compare(password, foundUser.password, function(err, result) {
//     // result == true
//     if(result == true){
//       res.render('secrets')
//     }
// });
//
//     }
//   });
     const username = req.body.username
     const password = req.body.password
     const user = new Worker({
       username :username,
       password : password
     });
     req.login(user, function(err){
       if(err){
         console.log(err);
       }else{
        WorkerProfile.findOne({email: username}, function(err, foundUser){
          if(err){
            res.redirect('register')
          }else{
            
            var name = db.WorkerProfile.find({_id: "63e722e30581e67cb7d9927c"});
            WorkerProfile
            // var workerName = db.mycollection.find({},{ "_id": 0, "host": 1 }).pretty();
            // var workerName = WorkerProfile.findOne{}
            console.log(name);
            // res.redirect('/worker');
            res.send("hello")

          }
        })
      
        //  passport.authenticate("local")(req, res, function(){
           
        //  });
       }
     });





});





app.post('/C-register', function(req, res){
  // const username = req.body.username
  // // const password = md5(req.body.password)
  // const password = req.body.password
  // bcrypt.hash(password, saltRounds, function(err, hash){
  //   if(!err){
  //     const newUser = new users({
  //       email : username,
  //       password : hash
  //
  //     });
  //     newUser.save(function(err){
  //       if(err){
  //         console.log(err);
  //       }else{
  //         res.render('secrets')
  //       }
  //     });
  //   }
  // });
 Client.register({username: req.body.username}, req.body.password, function(err){
  
   if(err){
     console.log(err);
     res.redirect('/register');
   }else{
    res.redirect('/C-form');
    //  passport.authenticate("local")(req, res, function(err){
      
       
    //   // res.send("DONE");
      
    //  });
   }
 });
});
app.post("/C-form", function (req, res) {
  
  var ClientName = req.body.name;
  var email = req.body.email;
  var ClientMobile = req.body.phone; 
  var address = req.body.address;
  
  res.render('client', 
  {
  name : ClientName,
  phone : ClientMobile,
  address : address,
  email: email
}
);



const newClient= new ClientProfile({

          name : ClientName,
          email: email,
          mobile : ClientMobile,
          address: address
         
  
      });
      newClient.save(function(err){
        if(err){
          console.log(err);
        }else{
          res.render('client')
        }
      });
});




app.post('/C-login', function(req, res){
//   const username = req.body.username
//   // const password = md5(req.body.password)
//   const password = req.body.password
//   users.findOne({email: username}, function(err , foundUser){
//     if(err){
//       res.send('Username or password incorrect')
//     }else{
//       bcrypt.compare(password, foundUser.password, function(err, result) {
//     // result == true
//     if(result == true){
//       res.render('secrets')
//     }
// });
//
//     }
//   });
     const username = req.body.username
     const password = req.body.password
     const user = new Client({
       username :username,
       password : password
     });
     req.login(user, function(err){
       if(err){
         console.log(err);
       }else{
        res.redirect('/secrets');
        //  passport.authenticate("local")(req, res, function(){
           
          
        //  });
       }
     });





});














app.listen(3000, function() {
  console.log("Server started on port 3000");
});
