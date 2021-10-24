require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app =  express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"hello how r u doing.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());//we use passport to manage our sessions

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
// mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/login",(req, res)=>{
    res.render("login")
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");

    }
    else{
        res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});
app.post("/register",(req,res)=>{
    User.register({username:req.body.username},req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");

            });
           
        }
    })
   
});

app.post("/login",(req,res)=>{
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");

            });
        }
    });

});


app.listen(3000,function(){
    console.log("successfully started at port 3000");
});
