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
}, { strict: false })

// Schema for Assignments
const AssignmentSchema = new Mongoose.Schema({
    title: String,
    description: String,
}, { strict: false })

const User = Mongoose.model('users', UserSchema)

const Course = Mongoose.model('courses', CourseSchema)

const Assignment = Mongoose.model('assignments', AssignmentSchema)

// Array of users
const activeUsers = () => User.find({ socketId: { $ne: null } }, { password: 0 })

// Array of courses
const listOfCourses = () => Course.find({ dept: { $ne: null } })

// Array of assignments
const listOfAssignments = () => Assignment.find({ title: { $ne: null } })

// Used for validating user for login using regular expression ('Bob' = 'bob')
const findUserByName = userName => User.findOne({ name: { $regex: `^${userName}$`, $options: 'i' } })

// Used to check if a course exists already (based on dept, number, and section)
const findCourseByDeptAndNumAndSection = (courseDept, courseNum, courseSection) => Course.findOne({ dept: courseDept, number: courseNum, section: courseSection })


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
const addCourse = (courseDept, courseName, courseNumber, courseSection, courseDescription, courseUnit, courseProf, courseRoom) => {
    // Return a user object if username is in db
    return findCourseByDeptAndNumAndSection(courseDept, courseNumber, courseSection, courseDescription, courseProf, courseRoom)
        .then(found => {
            // Check if course exists
            if (found) {
                throw new Error('Course Section already exists')
            }

            // Return an object if username doesnt exist
            return {
                dept: courseDept,
                name: courseName,
                number: courseNumber,
                section: courseSection,
                description: courseDescription,
                unit: courseUnit,
                prof: courseProf,
                room: courseRoom,
                assignments: []
            }
        })
        // Create course 
        .then(course => Course.create(course))
        // Return course dept, name, number, section, and unit
        .then(({_id, dept, name, number, section, description, unit, prof, room, assignments }) => {
            return {_id, dept, name, number, section, description, unit, prof, room, assignments }
        })
}

const enrollCourse = (userName, courseId) => {
    return User.findOneAndUpdate({ name: userName }, { "$push": { courses: courseId } })
        .then(user => {
            user.courses.forEach(courseObj => {
                if (courseObj === courseId) {
                    throw new Error('User is already enrolled in the course!')
                }
            })

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
        .then(({ _id }) => User.updateMany({}, { "$pull": { courses: courseId }}))
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')
            }

            return courseId
        })
}

// Edit course
const editCourse = (course) => {
    // Edit course
    return Course.findOneAndUpdate({ _id: course._id }, { $set: { dept: course.dept, name: course.name, number: course.number, section: course.section, description: course.description, unit: course.unit, prof: course.prof, room: course.room, assignments: [] } })
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')

            }
            return course._id
        })
}

// Post assignment
const postAssignment = (course, assignment) => {
    return Course.findOneAndUpdate({ _id: course._id }, { "$push": { assignments: assignment } })
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')
            }

            return { course: course, assignment: assignment }
        })
}

// Remove assignment
const removeAssignment = (course, assignment) => {
    // Remove course
    return Course.update({ _id: course._id }, { '$pull': { assignments: assignment } })
        .then 
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')
            }

            return { course: course, assignment: assignment }
        })
}


// Edit assignment
const editAssignment = (course, assignment) => {
    return Course.findOneAndUpdate({ _id: course._id }, { "$pull": { assignments: assignment} })
        .then(found => {
            if (!found) {
                throw new Error('Course does not exist')
            }

            return { course: course, assignment: assignment }
        })
        .then(obj => {
            Course.findOneAndUpdate({ _id: obj.course._id }, { "$push": { assignments: obj.assignment} })

            return
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
    removeAssignment
}