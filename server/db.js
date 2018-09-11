const
    config = require('./config.json'),
    Mongoose = require('mongoose'),
    { generateHash, validatePassword } = require('./validate')

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
    title: String,
    description: String,
}, { strict: false })

// Schema for Forum Posts
const ThreadSchema = new Mongoose.Schema({
    author: String,
    title: String,
    description: String,
    posts: Array
}, { strict: false })

const User = Mongoose.model('users', UserSchema)

const Course = Mongoose.model('courses', CourseSchema)

const Assignment = Mongoose.model('assignments', AssignmentSchema)

const Thread = Mongoose.model('threads', ThreadSchema)

// Array of users
const activeUsers = () => User.find({ socketId: { $ne: null } }, { password: 0 })

// Array of courses
const listOfCourses = () => Course.find({ dept: { $ne: null } })

// Array of assignments
const listOfAssignments = () => Assignment.find({ title: { $ne: null } })

// Array of assignments
const listOfThreads = () => Thread.find({ title: { $ne: null } })

// Used for validating user for login using regular expression ('Bob' = 'bob')
const findUserByName = (userName) => User.findOne({ name: { $regex: `^${userName}$`, $options: 'i' } })

// Used to check if a course exists already (based on dept, number, and section)
const findCourseByDeptAndNumAndSection = (course) => Course.findOne({ dept: course.dept, number: course.num, section: course.section })

// Used to check if an assignment exists already 
const findAssignment = (assignment) => Assignment.findOne({ title: assignment.title })

// Used to check if a post exists already 
const findThread = (thread) => Thread.findOne({ title: thread.title })


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
        .then(({ name, avatar, admin, courses }) => {
            return { name, avatar, admin, courses }
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
                admin: administrator,
                avatar: `https://robohash.org/${userName}`,
                courses: []
            }
        })
        // Create user from user object 
        .then(user => User.create(user))
        // Return name, avatar, admin, and courses
        .then(({ name, avatar, admin, courses }) => {
            return { name, avatar, admin, courses }
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
                assignments: []
            }
        })
        // Create course 
        .then(course => Course.create(course))
        // Return course dept, name, number, section, and unit
        .then(({ _id, dept, name, number, section, description, unit, prof, room, assignments }) => {
            return { _id, dept, name, number, section, description, unit, prof, room, assignments }
        })
}

// Enroll course for user
const enrollCourse = (userName, courseId) => {
    // Enroll course
    return User.findOneAndUpdate({ name: userName }, { "$push": { courses: courseId } })
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')
            }

            return courseId
        })
}

// Drop course for user
const dropCourse = (userName, courseId) => {
    // Drop course
    return User.findOneAndUpdate({ name: userName }, { '$pull': { courses: courseId } })
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')
            }
            return courseId
        })
}

// Remove course
const removeCourse = (courseId) => {
    // Remove course
    return Course.remove({ _id: courseId })
        .then(obj => User.updateMany({}, { "$pull": { courses: courseId } }))
        .then(obj=> {
            return courseId
        })
}

// Edit course
const editCourse = (course) => {
    // Edit course
    return Course.findOneAndUpdate({ _id: course._id }, { "$set": { dept: course.dept, name: course.name, number: course.number, section: course.section, description: course.description, unit: course.unit, prof: course.prof, room: course.room} })
        .then(obj => {
            return course
        })
}

// Post assignment
const postAssignment = (courseId, assignment) => {
    // Return an assignment object if assignment is not in db
    return findAssignment(assignment)
        .then(found => {
            // Check if assignment is taken already
            if (found) {
                throw new Error('Assignment already exists')
            }

            // Return an object if assignment doesnt exist
            return {
                title: assignment.title,
                description: assignment.description
            }
        })
        // Create assignment from assignment object 
        .then(assignment => Assignment.create(assignment))
        // Find the course and push the new assignment to the assignments array
        .then(({ id }) => Course.findOneAndUpdate({ _id: courseId }, { '$push': { assignments: id } }))
        .then((obj) => findAssignment(assignment))
        .then(({ _id, title, description }) => {
            return { courseId, _id, title, description }
        })
}

// Remove assignment
const removeAssignment = (courseId, assignment) => {
    return Assignment.remove(assignment)
        .then((obj) => Course.findOneAndUpdate({ _id: courseId }, { '$pull': { assignments: assignment._id } }))
        .then(obj => {
            return { courseId: courseId, assignmentId: assignment._id }
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
    return findThread(thread)
        .then(found => {
            // Check if post is taken already
            if (found) {
                throw new Error('Thread already exists')
            }

            // Return an object if post doesnt exist
            return {
                author: thread.author,
                title: thread.title,
                description: thread.description,
                posts: []
            }
        })
        // Create thread from thread object 
        .then(thread => Thread.create(thread))
        // Find the course and push the new thread to the threads array
        .then(({ id }) => Course.findOneAndUpdate({ _id: courseId }, { '$push': { threads: id } }))
        .then((obj) => findThread(thread))
        .then(({ _id, author, title, description, posts}) => {
            return { courseId, _id, author, title, description, posts}
        })
}

// Remove assignment
const removeThread = (courseId, thread) => {
    return Thread.remove(thread)
        .then((obj) => Course.findOneAndUpdate({ _id: courseId }, { '$pull': { threads: thread._id } }))
        .then(obj => {
            return { courseId: courseId, threadId: thread._id }
        })
}


// Edit thread
const editThread = (thread) => {
    return Thread.findOneAndUpdate({ _id: thread._id }, { "$set": {title: thread.title, description: thread.description} })
        .then(obj => {
            return thread
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
    editThread
}