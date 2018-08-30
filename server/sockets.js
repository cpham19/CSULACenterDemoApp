module.exports = (server, db) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    io.on('connection', socket => {
        // when a connection is made - load in the content already present on the server
        db.activeUsers().then(users => socket.emit('refresh-users', users))
        db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))

        // demo code only for sockets + db
        // in production login/user creation should happen with a POST to https endpoint
        // upon success - revert to websockets
        socket.on('create-user', (userName, password, admin) => {
            // create user
            db.createUser(userName, password, admin, socket.id)
                // success
                .then(created => io.emit('successful-join', created))
                // error
                .catch(err => io.emit('failed-join', { name: userName }))
        })

        socket.on('join-user', (userName, password) => {
            // login
            db.loginUser(userName, password, socket.id)
                // success
                .then(created => io.emit('successful-join', created))
                // error
                .catch(err => io.emit('failed-join', { name: userName }))
        })

        socket.on('disconnect', () => {
            // logout the user
            db.logoutUser(socket.id)
                // update the actives
                .then(() => db.activeUsers())
                .then(users => io.emit('refresh-users', users))
        })

        socket.on('add-course', (courseDept, courseName, courseNumber, courseSection, courseUnit) => {
            // add course
            db.addCourse(courseDept, courseName, courseNumber, courseSection, courseUnit)
                // success
                .then(added =>
                    io.emit('successful-add-course', added)
                )
                // error
                .catch(err => io.emit('failed-add-course', { dept: courseDept }))

            db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
        })

        socket.on('enroll-course', (userName, course) => {
            // enrolled course
            db.enrollCourse(userName, course)
                // success
                .then(enrolled =>
                    io.emit('successful-enroll-course', enrolled)
                )
                // error
                .catch(err => io.emit('failed-enroll-course', { dept: course.dept }))
        })
    })
}