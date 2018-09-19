const
    config = require('./config.json'),
    Mongoose = require('mongoose'),
    { generateHash, validatePassword } = require('./validate')

Mongoose.connect(config.uri, { useNewUrlParser: true })
Mongoose.connection.on('error', err => {
    console.log('MongoDB Connection Error:' + err)
})

// Schema for User 
const UserSchema = new Mongoose.Schema({
    firstName: String,
    lastName: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: Number,
    email: String,
    phoneNumber: String,
    name: String,
    avatar: String,
    socketId: String,
    password: String,
    admin: Boolean,
    courses: Array,
}, { strict: false })

// Schema for Courses
const CourseSchema = new Mongoose.Schema({
    dept: String,
    name: String,
    number: Number,
    section: Number,
    description: String,
    unit: Number,
    prof: String,
    room: String,
    assignments: Array,
    threads: Array
}, { strict: false })

// Schema for Assignments
const AssignmentSchema = new Mongoose.Schema({
    courseId: String,
    title: String,
    description: String,
}, { strict: false })

// Schema for Threads
const ThreadSchema = new Mongoose.Schema({
    courseId: String,
    authorName: String,
    authorAvatar: String,
    title: String,
    description: String,
    replies: Array,
}, { strict: false })

// Schema for Replies
const ReplySchema = new Mongoose.Schema({
    threadId: String,
    authorName: String,
    authorAvatar: String,
    description: String,
}, { strict: false })

const User = Mongoose.model('users', UserSchema)

const Course = Mongoose.model('courses', CourseSchema)

const Assignment = Mongoose.model('assignments', AssignmentSchema)

const Thread = Mongoose.model('threads', ThreadSchema)

const Reply = Mongoose.model('replies', ReplySchema)

// Array of users
const activeUsers = () => User.find({ socketId: { $ne: null } }, { password: 0 })

// Array of courses
const listOfCourses = () => Course.find({ dept: { $ne: null } })

// Array of assignments
const listOfAssignments = () => Assignment.find({ title: { $ne: null } })

// Array of assignments
const listOfThreads = () => Thread.find({ title: { $ne: null } })

// Array of assignments
const listOfReplies = () => Reply.find({ description: { $ne: null } })

// Used for validating user for login using regular expression ('Bob' = 'bob')
const findUserByName = (userName) => User.findOne({ name: { $regex: `^${userName}$`, $options: 'i' } })

// Used to check if a course exists already (based on dept, number, and section)
const findCourseByDeptAndNumAndSection = (course) => Course.findOne({ dept: course.dept, number: course.num, section: course.section })

// Used to check if an assignment exists already 
const findAssignment = (courseId, assignment) => Assignment.findOne({ courseId: courseId, title: assignment.title, description: assignment.description})

// Used to check if a thread exists already 
const findThread = (courseId, thread) => Thread.findOne({courseId: courseId, title: thread.title, authorName: thread.author.name, description: thread.description })

// Used to check if a reply exists already 
const findReply = (reply) => Reply.findOne({ threadId: reply.threadId, authorName: reply.author.name, description: reply.description })


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
        .then(({firstName, lastName, streetAddress, city, state, zipCode, email, phoneNumber, name, avatar, admin, courses }) => {
            return { firstName, lastName, streetAddress, city, state, zipCode, email, phoneNumber, name, avatar, admin, courses }
        })
}

// Create a user
const createUser = (firstName, lastName, streetAddress, city, state, zipCode, email, phoneNumber, userName, password, administrator, socketId) => {
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
                firstName: firstName,
                lastName: lastName,
                streetAddress: streetAddress,
                city: city,
                state: state,
                zipCode: zipCode,
                email: email,
                phoneNumber: phoneNumber,
                name: userName,
                password: generateHash(password),
                admin: administrator,
                avatar: `https://robohash.org/${userName}`,
                courses: []
            }
        })
        // Create user from user object 
        .then(user => User.create(user))
        // Return name, avatar, admin, and courses
        .then(({ firstName, lastName, streetAddress, city, state, zipCode, email, phoneNumber, name, avatar, admin, courses }) => {
            return { firstName, lastName, streetAddress, city, state, zipCode, email, phoneNumber,  name, avatar, admin, courses }
        })
}

// Logout the user by setting the user's socketid to null
const logoutUser = socketId => {
    return User.findOneAndUpdate({ socketId }, { $set: { socketId: null } })
}

// Add course
const addCourse = (course) => {
    // Return a user object if username is in db
    return findCourseByDeptAndNumAndSection(course)
        .then(found => {
            // Check if course exists
            if (found) {
                throw new Error('Course Section already exists')
            }

            // Return an object if username doesnt exist
            return {
                dept: course.dept,
                name: course.name,
                number: course.number,
                section: course.section,
                description: course.description,
                unit: course.unit,
                prof: course.prof,
                room: course.room,
                assignments: [],
                threads: []
            }
        })
        // Create course 
        .then(course => {
            return Course.create(course)
        })
    // // Return course dept, name, number, section, and unit
    // .then(({ _id, dept, name, number, section, description, unit, prof, room, assignments, threads }) => {
    //     return { _id, dept, name, number, section, description, unit, prof, room, assignments, threads }
    // })
}

// Enroll course for user
const enrollCourse = (userName, courseId) => {
    return User.findOneAndUpdate({ name: userName }, { "$push": { courses: courseId } })
        .then(found => {
            return courseId
        })
}

// Drop course for user
const dropCourse = (userName, courseId) => {
    return User.findOneAndUpdate({ name: userName }, { '$pull': { courses: courseId } })
        .then(found => {
            return courseId
        })
}

// Remove course
const removeCourse = (courseId) => {
    return Course.remove({ _id: courseId })
        .then(obj => User.updateMany({}, { "$pull": { courses: courseId } }))
        .then(obj => Assignment.remove({ courseId: courseId }))
        .then(obj => Thread.remove({ courseId: courseId }))
        .then(obj => {
            return courseId
        })
}

// Edit course
const editCourse = (course) => {
    return Course.findOneAndUpdate({ _id: course._id }, { "$set": { dept: course.dept, name: course.name, number: course.number, section: course.section, description: course.description, unit: course.unit, prof: course.prof, room: course.room }})
    .then(obj => {
        return course
    })
}

// Post assignment
const postAssignment = (courseId, assignment) => {
    // Return an assignment object if assignment is not in db
    return findAssignment(courseId, assignment)
        .then(found => {
            // Check if assignment is taken already
            if (found) {
                throw new Error('Assignment already exists')
            }

            // Return an object if assignment doesnt exist
            return {
                courseId: courseId,
                title: assignment.title,
                description: assignment.description,
                date: new Date().getTime()
            }
        })
        // Create assignment from assignment object 
        .then(assignment => Assignment.create(assignment))
        // Find the course and push the new assignment to the assignments array
        .then(({ id }) => Course.findOneAndUpdate({ _id: courseId }, { '$push': { assignments: id } }))
        .then((obj) => findAssignment(courseId, assignment))
}

// Remove assignment
const removeAssignment = (assignment) => {
    return Assignment.remove(assignment)
        .then((obj) => Course.findOneAndUpdate({ _id: assignment.courseId }, { '$pull': { assignments: assignment._id } }))
        .then(obj => {
            return assignment
        })
}

// Edit assignment
const editAssignment = (assignment) => {
    return Assignment.findOneAndUpdate({ _id: assignment._id }, { "$set": { title: assignment.title, description: assignment.description } })
    .then(obj => {
        return assignment
    })
}

// Post Thread
const postThread = (courseId, thread) => {
    // Return a thread object if thread is not in db
    return findThread(courseId, thread)
        .then(found => {
            // Check if post is taken already
            if (found) {
                throw new Error('Thread already exists')
            }

            // Return an object if post doesnt exist
            return {
                courseId: courseId,
                authorName: thread.author.name,
                authorAvatar: thread.author.avatar,
                title: thread.title,
                description: thread.description,
                replies: [],
                date: new Date().getTime()
            }
        })
        // Create thread from thread object 
        .then(thread => Thread.create(thread))
        // Find the course and push the new thread to the threads array
        .then(({ id }) => Course.findOneAndUpdate({ _id: courseId }, { '$push': { threads: id } }))
        .then((obj) => findThread(courseId, thread))
}

// Remove assignment
const removeThread = (thread) => {
    return Thread.remove(thread)
        .then(obj => Course.findOneAndUpdate({ _id: thread.courseId }, { '$pull': { threads: thread._id } }))
        .then(obj => Reply.remove({ threadId: thread._id }))
        .then(obj => {
            return thread
        })
}

// Edit thread
const editThread = (thread) => {
    return Thread.findOneAndUpdate({ _id: thread._id }, { "$set": { title: thread.title, description: thread.description } })
    .then(obj => {
        return thread
    })
}

// Reply to thread
const replyToThread = (reply) => {
    return findReply(reply)
        .then(found => {
            // Check if reply is posted already
            if (found) {
                throw new Error('Reply already exists')
            }

            // Return an object if post doesnt exist
            return {
                threadId: reply.threadId,
                authorName: reply.author.name,
                authorAvatar: reply.author.avatar,
                description: reply.description,
                date: new Date().getTime()
            }
        })
        .then(reply => Reply.create(reply))
        .then(({ id }) => Thread.findOneAndUpdate({ _id: reply.threadId }, { '$push': { replies: id } }))
        .then(obj => {
            return findReply(reply)
        })
}

// Remove assignment
const deleteReply = (reply) => {
    return Reply.remove(reply)
        .then(obj => Thread.findOneAndUpdate({ _id: reply.threadId }, { '$pull': { replies: reply._id } }))
        .then(obj => {
            return reply
        })
}

// Edit reply
const editReply = (reply) => {
    return Reply.findOneAndUpdate({ _id: reply._id }, { "$set": { description: reply.description } })
    .then(obj => {
        return reply
    })
}

module.exports = {
    activeUsers,
    createUser,
    loginUser,
    logoutUser,
    addCourse,
    listOfCourses,
    listOfAssignments,
    enrollCourse,
    dropCourse,
    removeCourse,
    editCourse,
    postAssignment,
    editAssignment,
    removeAssignment,
    listOfThreads,
    postThread,
    removeThread,
    editThread,
    replyToThread,
    listOfReplies,
    deleteReply,
    editReply,
}