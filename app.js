require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const alert = require("alert");
var username;
var ClientName;
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);


app.use(session({
  secret: "our little secret",
  resave: false,
  saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());





mongoose.connect('mongodb://127.0.0.1:27017/mongoDB',
  {             // connecting mongoose with node
    useNewUrlParser: true,

    useUnifiedTopology: true
  }, function (err) {
    if (err) {
      console.log(err);
    }
    else {
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
  name: String,
  email: String,
  mobile: String,
  skills: String,
  address: String



});

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  address: String

});

const ClientRequirementSchema = new mongoose.Schema({
  workDate: String,
  workDomain: String,
  workDescription: String,
  fees: String,
  ClientName:String
});


const LogSchema = new mongoose.Schema({
  
  applications : [String],
  accepted : String

});

usersSchema.plugin(passportLocalMongoose);
usersSchema.plugin(findOrCreate);



// usersSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']})





// creating model(collection)
const Worker = mongoose.model('Worker', usersSchema);
const WorkerProfile = mongoose.model('WorkerProfile', WorkerSchema);
const ClientProfile = mongoose.model('ClientProfile', ClientSchema);
const ClientRequirement = mongoose.model('ClientRequirement', ClientRequirementSchema);
const Log = mongoose.model('Log',LogSchema );


passport.use(Worker.createStrategy());
const Client = mongoose.model('Client', usersSchema);


passport.use(Client.createStrategy());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});


passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});


passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/Secrets"
},
  function (accessToken, refreshToken, profile, cb) {
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
  function (accessToken, refreshToken, profile, cb) {
    Client.findOrCreate({ googleId: profile.id }, function (err, Worker) {
      return cb(err, Worker);
    });
  }
));


app.get('/', function (req, res) {
  res.render('o')
});



app.get('/home', function (req, res) {
  res.render('home')
});


app.get('/C-home', function (req, res) {
  res.render('C-home')
})


app.get('/login', function (req, res) {
  res.render('login')
});


app.get('/register', function (req, res) {
  res.render('register')
});


app.get('/C-login', function (req, res) {
  res.render('C-login')
});


app.get('/C-register', function (req, res) {
  res.render('C-register')
});


app.get('/form', function (req, res) {
  res.render('form')
});


app.get('/worker', function (req, res) {
  res.render('worker')
});


app.get('/C-form', function (req, res) {
  res.render('C-form')
});


app.get('/client', function (req, res) {
  res.render('client')
})


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });





app.post('/register', function (req, res) {
  var workerUserName;
  Worker.register({ username: req.body.username }, req.body.password, function (err) {
    workerUserName = req.body.username;
    //  console.log(workerUserName);
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      res.redirect('/form');
    }
  });
});



app.post("/form", function (req, res) {

  var WorkerName = req.body.WorkerName;
  var Workeremail = req.body.Workeremail;
  var WorkerMobile = req.body.phone;
  var address = req.body.address;
  var skills = req.body.skills;

      ClientRequirement.find({}).exec((err,results)=>{
        res.render('worker',
        {
          WorkerName: WorkerName,
          Workeremail: Workeremail,
          phone: WorkerMobile,
          address: address,
          skills: skills,
          data:results
        }
      );
      });


  const newWorker = new WorkerProfile({

    name: WorkerName,
    email: Workeremail,
    mobile: WorkerMobile,
    skills: skills,
    address: address
  });
  newWorker.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render('worker')
    }
  });
});






app.post('/login', function (req, res) {

  var username = req.body.username
  WorkerProfile.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      res.render('register')
    } else if (foundUser) {
      var WorkerName = foundUser.name;
      var Workeremail = foundUser.email;
      var WorkerMobile = foundUser.mobile;
      var address = foundUser.address;
      var skills = foundUser.skills;
      ClientRequirement.find({}).exec((err,results)=>{
        res.render('worker',
        {
          WorkerName: WorkerName,
          Workeremail: Workeremail,
          phone: WorkerMobile,
          address: address,
          skills: skills,
          data:results
        }
      );
      });

    } else {
      res.render('register')

    }


  });

});




app.post('/C-register', function (req, res) {
  Client.register({ username: req.body.username }, req.body.password, function (err) {

    if (err) {
      console.log(err);
      res.redirect('/C-register');
    } else {
      res.redirect('/C-form');
    }
  });
});



app.post("/C-form", function (req, res) {

  ClientName = req.body.ClientName;
  var email = req.body.email;
  var ClientMobile = req.body.phone;
  var address = req.body.address;

  res.render('client',
    {
      ClientName: ClientName,
      email: email
    }
  );

  const newClient = new ClientProfile({

    name: ClientName,
    email: email,
    mobile: ClientMobile,
    address: address


  });
  newClient.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render('client')
    }
  });
});










app.post('/C-login', function (req, res) {
  username = req.body.username
  // console.log("gello");
  // console.log(username);
  // console.log(req.body.username);
  ClientProfile.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      res.render('C-register')
    } else if (foundUser) {
      ClientName = foundUser.name;
      var Clientemail = foundUser.email;
      res.render('client',
        {
          ClientName: ClientName,
          email: Clientemail
        }
      );

    } else {
      res.redirect('/C-register');

    }
  });
});



// console.log(username);
app.post("/client",function (req, res) {
  
  var workDate = req.body.date;
  var workDomain = req.body.domain;
  var workDescription = req.body.description;
  var fees = req.body.fees;



  const newRequirement = new ClientRequirement({

    workDate: workDate,
    workDomain: workDomain,
    workDescription: workDescription,
    fees: fees,
    ClientName:ClientName

  });
  newRequirement.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      ClientProfile.findOne({ email: username }, function (err, foundUser) {
        if (err) {
          res.render('C-register')
        } else if (foundUser) {
          var ClientName = foundUser.name;
          var Clientemail = foundUser.email;
          res.render('client',
            {
              ClientName: ClientName,
              email: Clientemail
            }
          );
    
        }
      });

    }
  });

});




















app.listen(3000, function () {
  console.log("Server started on port 3000");
});
