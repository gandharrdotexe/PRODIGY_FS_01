const User = require('../models/user');
const jwt = require('jsonwebtoken');

//handling errors
const handleErrors = (err) =>{
    console.log(err.message, err.code);
    let errors = {email: '', password: ''};
    
    //duplicate email
    if(err.code === 11000){
        errors.email = 'Email already registered';
        return errors;
    }

    // incorrect email
    if (err.message === 'invalid email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'invalid password') {
        errors.password = 'That password is incorrect';
    }



    //validations
    if(err.message.includes('user validation failed')){
        //console.log(err.message);
        Object.values(err.errors).forEach(({properties}) => {
            // console.log(error.properties)
            errors[properties.path] = properties.message; 
        });
    }

    return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'gandharvaliduser secret', {
    expiresIn: maxAge
  });
};


module.exports.signup_get = (req, res) => {
    res.render('signup');
};

module.exports.login_get = (req, res) => {
    const token = req.cookies.jwt;
    if(!token){
        res.render('login');
    }else{
        res.redirect('/');
    }
    
};

module.exports.signup_post = async(req, res) => {
    //res.render('signup');
    const{email, password} = req.body;
    // console.log(email, password);
    // res.send("New Sign up");
    try{
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    }
    catch(err){
        // console.log(err);
        const error = handleErrors(err);
        // res.send('User is not created');
        res.status(400).json({ error });
    }
};

module.exports.login_post = async (req, res) => {
    //res.render('signup');
    const{email, password} = req.body;
    // console.log(email, password);
    // res.send("New login");
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
      } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }

};

module.exports.logout_get = (req,res)=>{
    res.cookie('jwt', '', {maxAge:1});//naming jwt cookie as null so that server cant read jwt cookie and the user logs out
    res.redirect('/');
}
