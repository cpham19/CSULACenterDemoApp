const
    config = require('./config.json'),
    Mongoose = require('mongoose'),
    { generateHash, validatePassword } = require('./validate'),
    random = require('mongoose-simple-random');

Mongoose.connect(config.uri)
Mongoose.connection.on('error', err => {
    console.log('MongoDB Connection Error:' + err)
})

// Schema for User 
const UserSchema = new Mongoose.Schema({
    name: String,
    avatar: String,
    socketId: String,
    password: String,
    admin: Boolean,
    score: Number,
}, { strict: false })

const User = Mongoose.model('users', UserSchema)

// Array of users
const activeUsers = () => User.find({ socketId: { $ne: null } }, { password: 0 })

// Used for validating user for login using regular expression ('Bob' = 'bob')
const findUserByName = userName => User.findOne({ name: { $regex: `^${userName}$`, $options: 'i' } })

// Validating user for logging in
const loginUser = (userName, password, socketId) => {
    // Find if the username is in the db
    return findUserByName(userName)
        .then(found => {
            // Checks if username doesn't exist
            if (!found) {
                throw new Error('User does not exists')
            }

            // validate the password
            const valid = validatePassword(password, found.password)
            if (!valid) {
                throw new Error('Invalid Password')
            }

            // Validate that the user hasn't logged in yet!
            if (found.socketId != null) {
                throw new Error('User is already logged in')
            }

            return found
        })
        // active == have socketId
        .then(({ _id }) => User.findOneAndUpdate({ _id }, { $set: { socketId } }))
        // return name and avatar
        .then(({ name, avatar, admin, score}) => {
            return { name, avatar, admin, score}
        })
}

// Create a user
const createUser = (userName, password, administrator, socketId) => {
    // Return a user object if username is in db
    return findUserByName(userName)
        .then(found => {
            // Check if username is taken already
            if (found) {
                throw new Error('User already exists')
            }

            // Return an object if username doesnt exist
            return {
                socketId,
                name: userName,
                password: generateHash(password),
                admin : administrator,
                avatar: `https://robohash.org/${userName}`,
                score: 0
            }
        })
        // Create user from user object 
        .then(user => User.create(user))
        // Return avatar and name
        .then(({ name, avatar, admin, score}) => {
            return { name, avatar, admin, score}
        })
}

// Logout the user by setting the user's socketid to null
const logoutUser = socketId => {
    return User.findOneAndUpdate({ socketId }, { $set: { socketId: null } })
}

module.exports = {
    activeUsers,
    createUser,
    loginUser,
    logoutUser
}