module.exports = (server, db) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    io.on('connection', socket => {
        // when a connection is made - load in the content already present on the server
        db.activeUsers().then(users => socket.emit('refresh-users', users))
        db.listOfCourses().then(courses => socket.emit('refresh-courses', courses))
        db.listOfAssignments().then(assignments => socket.emit('refresh-assignments', assignments))
        db.listOfThreads().then(threads => socket.emit('refresh-threads', threads))
        db.listOfReplies().then(replies => socket.emit('refresh-replies', replies))

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

        socket.on('add-course', (course) => {
            // add course
            db.addCourse(course)
                // success
                .then(added =>
                    io.emit('successful-add-course', added)
                )
                // error
                .catch(err => io.emit('failed-add-course', { dept: courseDept }))
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
        })

        socket.on('post-assignment', (courseId, assignment) => {
            // Post assignment
            db.postAssignment(courseId, assignment)
                // success
                .then(obj =>
                    io.emit('successful-post-assignment', obj)
                )
                // error
                .catch(err => io.emit('failed-post-assignment', 'Failed to post assignment'))
        })

        socket.on('remove-assignment', (courseId, assignment) => {
            // remove course
            db.removeAssignment(courseId, assignment)
                // success
                .then(removed =>
                    io.emit('successful-remove-assignment', removed)
                )
                // error
                .catch(err => io.emit('failed-remove-assignment', 'Failed to remove assignment'))
        })

        socket.on('edit-assignment', (assignment) => {
            // Edit assignment
            db.editAssignment(assignment)
                // success
                .then(obj =>
                    io.emit('successful-edit-assignment', obj)
                )
                // error
                .catch(err => io.emit('failed-edit-assignment', 'Failed to edit assignment'))
        })

        socket.on('post-thread', (courseId, thread) => {
            // Post Thread
            db.postThread(courseId, thread)
                // success
                .then(obj =>
                    io.emit('successful-post-thread', obj)
                )
                // error
                .catch(err => io.emit('failed-post-thread', 'Failed to post thread'))
        })

        socket.on('remove-thread', (courseId, thread) => {
            // remove thread
            db.removeThread(courseId, thread)
                // success
                .then(removed =>
                    io.emit('successful-remove-thread', removed)
                )
                // error
                .catch(err => io.emit('failed-remove-thread', 'Failed to remove thread'))
        })

        socket.on('edit-thread', (thread) => {
            // Edit thread
            db.editThread(thread)
                // success
                .then(obj =>
                    io.emit('successful-edit-thread', obj)
                )
                // error
                .catch(err => io.emit('failed-edit-thread', 'Failed to edit thread'))
        })

        socket.on('reply-thread', (reply) => {
            // Reply to thread
            db.replyToThread(reply)
                // success
                .then(obj =>
                    io.emit('successful-reply-thread', obj)
                )
                // error
                .catch(err => io.emit('failed-reply-thread', 'Failed to reply to thread'))
        })

        socket.on('delete-reply', (reply) => {
            // Delete reply
            db.deleteReply(reply)
                // success
                .then(obj =>
                    io.emit('successful-delete-reply', obj)
                )
                // error
                .catch(err => io.emit('failed-delete-reply', 'Failed to delete the reply'))
        })

        socket.on('edit-reply', (reply) => {
            // Edit reply
            db.editReply(reply)
                // success
                .then(obj =>
                    io.emit('successful-edit-reply', obj)
                )
                // error
                .catch(err => io.emit('failed-edit-reply', 'Failed to edit reply'))
        })
    })
}