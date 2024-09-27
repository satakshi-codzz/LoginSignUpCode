import express from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import collection from "./mongodb.js";
import flash from "express-flash";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from 'bcrypt';

// In this line i add port from .env file to a PORT variable 
const PORT = process.env.PORT;

// In this express function in assig to app variable 
const app = express();


// Middleware to serve static files from 'public' folder
app.use(express.static('public'));

app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}));
app.use(flash());
// app.use is used to mount the middleware functions and express.json() is a in built middleware that parses incoming requests with json payload 
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json());

// in this line i tell node js that we are using ejs template engine 
app.set('view engine', 'ejs');

// If we are using the ejs or any other templat eengine our folder name should be views. But in this case our ejs files locate under template folder so we must tell node to consider templates folder as views folder 
const __filename = new URL(import.meta.url).pathname;
const __fileDirname = path.dirname(__filename);
const __dirname = path.dirname(__fileDirname);
const templatePath = path.join(__dirname , 'templates');

app.set('views', templatePath);

// This is how i add route for home page and render ejs file to show on home page 
app.get('/', (req,res)=>{
    const userData = req.session.name;
    res.render('login', {
        name: userData,
        messages: req.flash()
    });
});

// This is how i add route for signup page and render ejs file to show on signup page 
app.get('/signup', (req,res)=>{
    const userName = req.session.name;
    const userEmail = req.session.email;
    const userNumber = req.session.number;
    const userPassword = req.session.password;

    res.render('signup', {
        name: userName,
        email: userEmail,
        number: userNumber,
        password: userPassword,
        messages: req.flash()
    });
});

// This is how i add route for signup page and render ejs file to show on signup page 
app.get('/home', (req,res)=>{
    const userData = req.session.name;
    res.render('home', {
        name: userData,
        messages: req.flash()
    });
});

async function hashPassword(plainPassword){
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}
// This is how i send data to mongodb if user submit signup form 
app.post('/signup', async(req,res)=>{
    const userPassword = await hashPassword(req.body.password);
    req.session.name = req.body.name;
    req.session.email = req.body.email;
    req.session.number = req.body.number;
    req.session.password = req.body.password;
    const data = {
        name:req.body.name,
        email:req.body.email,
        number:req.body.number,
        password: userPassword
    };
    try{
        const check = await collection.findOne({email:req.body.email});

        if(!data.name || !data.email || !data.number || !data.password){
            req.flash("error", "All fields are required");
            return res.redirect("signup");
        }else if(check && check.email === req.body.email){
            req.flash("error", "You email adress should be unique");
            return res.redirect("signup");
        }
    
        const entry = await collection.insertMany([data]);
        if(entry){
            req.flash("success", "You are successfully registered!");
            return res.redirect('signup');
        }
          
    }
    catch (err) {
        console.log(`Error during registration: ${err}`);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect('/signup');
    }
});


// This is how i check when user login the password should be same
app.post('/login', async(req,res)=>{
    const data = {
        name:req.body.name,
        password:req.body.password
    };

    req.session.name = data.name;
    try{
        const checkUser = await collection.findOne({name:req.body.name});
        const userPassword = data.password;
        const dbPassword = checkUser.password;
        const password = await bcrypt.compare(userPassword, dbPassword);

        if(!data.name || !data.password){
            req.flash("error", "Please enter your name and password");
            return res.redirect('/');
        }else if(checkUser && !password){
            req.flash("error", "Your password must be same");
            return res.redirect('/');
        }

        req.flash("success", "Your are welcome to Home Page");
        setTimeout(()=>{
            return res.redirect('home');
        }, 2000)
        
    }
    catch (err) {
        console.log(`Error during login your account: ${err}`);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/")
    }
});

app.get('/*', (req,res)=>{
    res.render('404-page');
});


app.listen(PORT, ()=>{
    console.log("Server is connected successfully");
});


