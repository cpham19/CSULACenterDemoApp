module.exports = (server, db) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    io.on('connection', socket => {
        // when a connection is made - load in the content already present on the server
        db.activeUsers().then(users => socket.emit('refresh-users', users))
        db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
        db.listOfAssignments().then(assignments => socket.emit('refresh-assignments', assignments))

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

        socket.on('add-course', (courseDept, courseName, courseNumber, courseSection, courseDescription, courseUnit, courseProf, courseRoom) => {
            // add course
            db.addCourse(courseDept, courseName, courseNumber, courseSection, courseDescription, courseUnit, courseProf, courseRoom)
                // success
                .then(added =>
                    io.emit('successful-add-course', added)
                )
                // error
                .catch(err => io.emit('failed-add-course', { dept: courseDept }))

            db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
        })

        socket.on('enroll-course', (userName, courseId) => {
            // enrolled course
            db.enrollCourse(userName, courseId)
                // success
                .then(enrolled =>
                    io.emit('successful-enroll-course', enrolled)
                )
                // error
                .catch(err => io.emit('failed-enroll-course', 'Failed to enroll course'))
        })

        socket.on('drop-course', (userName, courseId) => {
            // drop course
            db.dropCourse(userName, courseId)
                // success
                .then(dropped =>
                    io.emit('successful-drop-course', dropped)
                )
                // error
                .catch(err => io.emit('failed-drop-course', 'Fail to drop course'))
        })

        socket.on('remove-course', (courseId) => {
            // remove course
            db.removeCourse(courseId)
                // success
                .then(removed =>
                    io.emit('successful-remove-course', removed)
                )
                // error
                .catch(err => io.emit('failed-remove-course', 'Failed to remove course'))

            db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
            db.listOfAssignments().then(assignments => socket.emit('refresh-assignments', assignments))
        })

        socket.on('edit-course', (course) => {
            // edit course
            db.editCourse(course)
                // success
                .then(editted =>
                    io.emit('successful-edit-course', editted)
                )
                // error
                .catch(err => io.emit('failed-edit-course', 'Failed to edit course'))

            db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
        })

        socket.on('post-assignment', (course, assignment) => {
            // Post assignment
            db.postAssignment(course, assignment)
                // success
                .then(obj =>
                    io.emit('successful-post-assignment', obj)
                )
                // error
                .catch(err => io.emit('failed-post-assignment', 'Failed to post assignment'))

            db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
            db.listOfAssignments().then(assignments => socket.emit('refresh-assignments', assignments))
        })

        socket.on('remove-assignment', (course, assignment) => {
            // remove course
            db.removeAssignment(course, assignment)
                // success
                .then(removed =>
                    io.emit('successful-remove-assignment', removed)
                )
                // error
                .catch(err => io.emit('failed-remove-assignment', 'Failed to remove assignment'))

            db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
            db.listOfAssignments().then(assignments => socket.emit('refresh-assignments', assignments))
        })

        socket.on('edit-assignment', (course, assignment) => {
            // Edit assignment
            db.editAssignment(course, assignment)
                // success
                .then(obj =>
                    io.emit('successful-edit-assignment', obj)
                )
                // error
                .catch(err => io.emit('failed-edit-assignment', 'Failed to edit assignment'))
                
            db.listOfAssignments().then(assignments => socket.emit('refresh-assignments', assignments))
        })
    })
}