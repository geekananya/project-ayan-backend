require('dotenv').config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const genuuid = require("uuid").v4;
const { registerUser, verifyLogin } = require("../Controllers/controllers.js");
const {updateLocation, addFundraiser} = require("../Database/database.js");


const app = express();
app.use(cors());

// Use express-session middleware
app.use(session({
  // store: new (require('connect-pg-simple')(session))({
  //   // Insert connect-pg-simple options here
  //   pgPromise: require("../Database/database.js").db,
  //   createTableIfMissing: true
  // }),
  genid: function (req) {
    console.log("session id created");
    return genuuid();
  },
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, 
    // sameSite: 'None',
    expires: 60000 },
  // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// app.set('trust proxy', 1);

app.use(express.urlencoded({extended: false}));    //middleware for accessing req.body
app.use(express.json());    //for accessing req.body


//ROUTES
app.get("/", (req, res)=>{
  // console.log("Root route session - ", req.sessionID);
  console.log("Root session - ", req.sessionID);
  res.send("Able to send responses");
  // if(true){ req.session.isAuth = true;
  // res.redirect("/dashboard");}
})

// app.post('/register', async (req, res) => await registerUser(req, res));
app.post('/login', async (req,res) => await verifyLogin(req,res));


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});


app.post("/update-location", async (req, res)=>{
  const {user_id, latitude, longitude} = req.body;
  try{
    const result = await updateLocation(user_id, latitude, longitude);
    res.json(result);
  }catch(err){
    console.log("Error:", err);
    res.status(400).send('Unable to update location!');
  }
})

app.post("/start-fundraiser", async (req, res)=> {
  const {title, goal, description, info, link} = req.body;
  try{
    const id = await addFundraiser(title, goal, description, info, link);
    res.status(200).json({id});
  }catch(err){
    console.log("Error:", err);
    res.status(400).send(`Unable to add fundraiser.`);
  }
})


const PORT = 3000;
app.listen(PORT, ()=>{
  console.log(`Server is listening to port ${PORT}`);
});




// const isAuthenticated = (req, res, next) => {
//   if(req.session.isAuth)  next();
//   else{
//     res.redirect("/");
//     console.log("You are not authorised!");
//     // res.send("You are not authorised!");
//   }
// }

// app.get("/dashboard", (req, res)=>{
  //   // console.log("Dashboard session - ", req.sessionID);
  //   // res.flash("this is dashh");
  //   // console.log(`Welcome, ${req.session.user}, to dashhhh`);
  //   // res.send(`Welcome, ${req.session.user}, to dashhhh`);
  //   console.log("Dashboard session - ", req.sessionID);
  //   if(req.session.isAuth)
  //     res.status(200).send("dash");
//     res.status(400).send("no dash");
// })

// app.get("/profile", isAuthenticated, (req, res)=>{
  //   res.send("profile.");
// })
  
  
  
// const isValidRequest = (req) => {
//   return req.method === 'GET' && req.query.key === 'somekey';
// };

// app.get('/proxy', (req, res) => {
  //   if (!isValidRequest(req)) {
    //     return res.status(400).send('Invalid request');
    //   }
    
    //   const url = req.query.url;
    //   if (!url) {
      //     return res.status(400).send('Missing URL parameter');
//   }

//   console.log("url", url);
//   // Fetch the content from the external website
//   fetch(url)
//     .then((response) => response.text())
//     .then((data) => {
//       // Set the correct MIME type for stylesheets
//       if (url.endsWith('.css')) {
//         res.set('Content-Type', 'text/css');
//       } else {
  //         res.set('Content-Type', 'text/html');
  //       }
  //       res.send(data);
  //     })
  //     .catch((error) => {
    //       console.error(error);
    //       res.status(500).send('Error fetching content');
    //     });
    // });


//   else