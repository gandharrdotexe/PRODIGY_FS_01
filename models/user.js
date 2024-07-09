const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');


const userSchemea = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Please enter an email address'],
        unique: [true, 'Email address already in use'],
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email address']
    },
    password:{
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'The minimum password length should be 6 characters']
    },
});

// userSchemea.post('save', function(doc, next){
//     console.log('New user was created and saved', doc);
//     next();
// });

userSchemea.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchemea.statics.login = async function(email, password){
    const user = await this.findOne({email});
    if(user){
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error('invalid password');
    }
    throw Error('invalid email'); 
}

const User = mongoose.model('user', userSchemea);
module.exports = User;