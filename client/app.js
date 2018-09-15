const socket = io()

const component = {
    template: `<div class="column"> 
                <h6 align="center">Questions in Database ({{list.length}})</h6>
                <hr>
                <ul v-for="obj in list">
                    <li>
                        <p v-show="admin">{{obj.question}} <button v-on:click="$emit('delete', obj.question)" class="delete" type="submit">Delete</button></p>
                        <p v-show="!admin">{{obj.question}}</p>
                    </li>
                    <hr>
                </ul>
            </div>`,
    props: ['list', 'admin']
}

const app = new Vue({
    el: '#demo-app',
    data: {
        loggedIn: false,
        userName: '',
        password: '',
        failedName: '',
        failed: '',
        admin: false,
        me: {},
        users: [],
        courses: [],
        assignments: [],
        threads: [],
        replies: [],
        state: 'Home',
        courseDept: '',
        courseName: '',
        courseNumber: '',
        courseSection: '',
        courseDescription: '',
        courseUnit: '',
        courseProf: '',
        courseRoom: '',
        search: true,
        add: false,
        drop: false,
        remove: false,
        edit: false,
        searchedCourses: [],
        addingAssignment: false,
        edittingAssignment: false,
        assignmentOfCourseToAdd: '',
        assignmentTitle: '',
        assignmentDescription: '',
        newCourse: {},
        newAssignment: {},
        courseOfAssignmentToEdit: '',
        courseOfThreadToAdd: '',
        threadTitle: '',
        threadDescription: '',
        addingThread: false,
        edittingThread: false,
        newThread: {},
        viewingAssignment: false,
        assignmentToView: {},
        viewingThread: false,
        threadToView: {},
        newReply: '',
    },
    created: function () {
        // Unload resources after closing tab or browser
        document.addEventListener('beforeunload', this.handler)
    },
    methods: {
        handler: function handler(event) { },
        joinUser: function () {
            // Reject if user doesn't put name or password
            if (!this.userName || !this.password) {
                return
            }

            socket.emit('join-user', this.userName, this.password)
        },
        signupUser: function () {
            // Reject if user doesn't put name or password
            if (!this.userName || !this.password) {
                return
            }

            socket.emit('create-user', this.userName, this.password, this.admin)
        },
        changeState: function (state) {
            this.state = state
        },
        changeCourseState: function (state) {
            this.courseDept = ''
            this.courseNumber = ''

            if (state === 'search') {
                this.searchedCourses = []
                this.search = true
                this.add = false
                this.drop = false
                this.remove = false
                this.edit = false
            }
            else if (state === 'add') {
                this.search = false
                this.add = true
                this.drop = false
                this.remove = false
                this.edit = false
            }
            else if (state === 'drop') {
                this.search = false
                this.add = false
                this.drop = true
                this.remove = false
                this.edit = false
            }
            else if (state === 'remove') {
                this.search = false
                this.add = false
                this.drop = false
                this.remove = true
                this.edit = false
            }
            else if (state === 'edit') {
                this.search = false
                this.add = false
                this.drop = false
                this.remove = false
                this.edit = true
            }
        },
        addCourse: function () {
            if (!this.courseDept || !this.courseName || !this.courseSection || !this.courseDescription || !this.courseUnit || !this.courseProf || !this.courseRoom) {
                return
            }

            const course = { dept: this.courseDept, name: this.courseName, number: this.courseNumber, section: this.courseSection, description: this.courseDescription, unit: this.courseUnit, prof: this.courseProf, room: this.courseRoom }

            socket.emit('add-course', course)
        },
        searchCourse: function () {
            // If courseDept is empty, do nothing
            // If both are empty, do nothing
            if (!this.courseDept || (!this.courseDept && !this.courseNumber)) {
                return
            }

            this.searchedCourses = []

            // Filter the complete list of courses in database
            // If user only selected a department OR
            // If user selected a department and typed a course number
            this.searchedCourses = this.courses.filter(course => (course.dept === this.courseDept && !this.courseNumber) || (course.dept === this.courseDept && course.number == this.courseNumber))

            // Filter the search results based on the user's enrolled courses
            this.me.courses.forEach(courseId => {
                this.searchedCourses = this.searchedCourses.filter(course => !(courseId === course._id))
            })
        },
        enrollCourse: function (courseId) {
            if (!courseId) {
                return
            }

            socket.emit('enroll-course', this.me.name, courseId)
        },
        dropCourse: function (courseId) {
            if (!courseId) {
                return
            }

            socket.emit('drop-course', this.me.name, courseId)
        },
        removeCourse: function (courseId) {
            if (!courseId) {
                return
            }

            socket.emit('remove-course', courseId)
        },
        editCourse: function (newCourse) {
            if (!newCourse.dept || !newCourse.name || !newCourse.section || !newCourse.description || !newCourse.unit || !newCourse.prof || !newCourse.room) {
                return
            }
            socket.emit('edit-course', newCourse)
        },
        addAssignment: function (course) {
            this.addingAssignment = true
            this.edittingAssignment = false
            this.assignmentOfCourseToAdd = course
        },
        postAssignment: function (courseId, assignmentTitle, assignmentDescription) {
            if (!assignmentTitle || !assignmentDescription) {
                return
            }

            const assignment = { title: assignmentTitle, description: assignmentDescription }
            socket.emit('post-assignment', courseId, assignment)
        },
        removeAssignment: function (courseId, assignment) {
            socket.emit('remove-assignment', courseId, assignment)
        },
        selectAssignmentToEdit: function (assignment) {
            this.addingAssignment = false
            this.edittingAssignment = true
            this.newAssignment = assignment
        },
        editAssignment: function (assignment) {
            if (!assignment.title || !assignment.description) {
                return
            }

            socket.emit('edit-assignment', assignment)
        },
        createThread: function (course) {
            this.addingThread = true
            this.edittingThreadt = false
            this.courseOfThreadToAdd = course
        },
        postThread: function (courseId, author, threadTitle, threadDescription) {
            if (!threadTitle || !threadDescription) {
                return
            }
            
            const modifiedAuthor = {name: author.name, avatar: author.avatar}

            const thread = { author: modifiedAuthor, title: threadTitle, description: threadDescription }
            socket.emit('post-thread', courseId, thread)
        },
        removeThread: function (courseId, thread) {
            socket.emit('remove-thread', courseId, thread)
        },
        selectThreadToEdit: function (thread) {
            this.addingThread = false
            this.edittingThread = true
            this.newThread = thread
        },
        editThread: function (thread) {
            if (!thread.title || !thread.description) {
                return
            }

            socket.emit('edit-thread', thread)
        },
        viewAssignment: function (assignment) {
            this.viewingAssignment = true
            this.assignmentToView = assignment
        },
        backOutAssignment: function () {
            this.viewingAssignment = false
            this.assignmentToView = {}
        },
        viewThread: function (thread) {
            this.viewingThread = true
            this.threadToView = thread
        },
        backOutThread: function () {
            this.viewingThread = false
            this.threadToView = {}
        },
        replyToThread: function (threadId, author, newReply) {
            if (!newReply) {
                return
            }

            const modifiedAuthor = {name: author.name, avatar: author.avatar}

            const reply = { threadId: threadId, author: modifiedAuthor, description: newReply }
            socket.emit('reply-thread', reply)
        }
    },
    components: {
    }
})

// Client Side Socket Event

// Refresh userlist
socket.on('refresh-users', users => {
    app.users = users
})

// Refresh courses
socket.on('refresh-courses', courses => {
    app.courses = courses
})

// Refresh assignments
socket.on('refresh-assignments', assignments => {
    app.assignments = assignments
})

// Refresh threads
socket.on('refresh-threads', threads => {
    app.threads = threads
})

// Refresh replies
socket.on('refresh-replies', replies => {
    app.replies = replies
})

// Successfully join (change screen)
socket.on('successful-join', user => {
    if (app.userName === user.name) {
        app.me = user
        app.loggedIn = true
        app.failed = ''
        app.password = ''

        app.users.push(user)
    }
})

// Failed to join because username exists
socket.on('failed-join', obj => {
    if (obj.name === app.userName) {
        app.failedName = obj.name
    }
})

// Added course
socket.on('successful-add-course', courseObj => {
    if (app.userName === app.me.name) {
        app.courseDept = ''
        app.courseName = ''
        app.courseNumber = ''
        app.courseSection = ''
        app.courseDescription = ''
        app.courseUnit = ''
        app.courseProf = ''
        app.courseRoom = ''
        app.courses.push(courseObj)

        console.log("ADDED THE COURSE: " + courseObj._id)
    }
})

// Added course
socket.on('successful-enroll-course', courseId => {
    if (app.userName === app.me.name) {
        app.me.courses.push(courseId)

        // Filter the search results after enrolling a course
        app.searchedCourses = app.searchedCourses.filter(courseObj => !(courseObj._id === courseId))

        console.log("DROPPED THE COURSE: " + courseId)
    }
})

// Dropped course
socket.on('successful-drop-course', courseId => {
    if (app.userName === app.me.name) {
        app.me.courses = app.me.courses.filter(courseObj => !(courseObj === courseId))

        console.log("DROPPED THE COURSE: " + courseId)
    }
})

// Remove course
socket.on('successful-remove-course', courseId => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.filter(courseObj => !(courseObj._id === courseId))

        console.log("REMOVED THE COURSE: " + courseId)
    }
})

// Edit course
socket.on('successful-edit-course', course => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === course._id) {
                courseObj = course
            }

            return courseObj
        })

        app.newCourse.dept = ''
        app.newCourse.name = ''
        app.newCourse.number = ''
        app.newCourse.section = ''
        app.newCourse.description = ''
        app.newCourse.unit = ''
        app.newCourse.prof = ''
        app.newCourse.room = ''
    }
    console.log("EDITTED THE COURSE: " + course._id)
})

// Edit assignment
socket.on('successful-edit-assignment', assignment => {
    if (app.userName === app.me.name) {
        app.assignments = app.assignments.map(assignmentObj => {
            if (assignmentObj._id === assignment._id) {
                assignmentObj = assignment
            }

            return assignmentObj
        })

        app.edittingAssignment = false
        console.log("EDITTED THE ASSIGNMENT: " + assignment._id)
    }
})

// Remove assignemnt
socket.on('successful-remove-assignment', obj => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === obj.courseId) {
                courseObj.assignments = courseObj.assignments.filter(assignmentId => !(assignmentId === objt.assignmentId))
            }

            return courseObj
        })

        app.assignments = app.assignments.filter(assignmentId => !(assignmentId === obj.assignmentId))

        console.log("REMOVED THE ASSIGNMENT: " + obj.assignmentId)
    }
})

// Posted assignment
socket.on('successful-post-assignment', assignment => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === assignment.courseId) {
                courseObj.assignments.push(assignment._id)
            }

            return courseObj
        })

        app.assignments.push(assignment)

        app.assignmentOfCourseToAdd.title = ''
        app.assignmentOfCourseToAdd.description = ''
        app.addingAssignment = false

        console.log("POSTED ASSIGNMENT: " + assignment._id)
    }
})

// Posted forum post
socket.on('successful-post-thread', thread => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === thread.courseId) {
                courseObj.threads.push(thread._id)
            }

            return courseObj
        })

        app.threads.push(thread)

        app.threadTitle = ''
        app.threadDescription = ''
        app.addingThread = false
        app.courseOfThreadToAdd = {}

        console.log("POSTED THREAD: " + thread._id)
    }
})

// Remove thread
socket.on('successful-remove-thread', obj => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === obj.courseId) {
                courseObj.threads = courseObj.threads.filter(threadId => !(threadId === obj.threadId))
            }

            return courseObj
        })

        app.threads = app.threads.filter(threadId => !(threadId === obj.threadId))

        console.log("REMOVED THE THREAD: " + obj.threadId)
    }
})

// Edit thread
socket.on('successful-edit-thread', thread => {
    console.log(thread)
    if (app.userName === app.me.name) {
        app.threads = app.threads.map(threadObj => {
            if (threadObj._id === thread._id) {
                threadObj = thread
            }

            return threadObj
        })

        app.edittingThread = false
        console.log("EDITTED THE Thread: " + thread._id)
    }
})

// Posted reply
socket.on('successful-reply-thread', reply => {
    if (app.userName === app.me.name) {
        app.threads = app.threads.map(thread => {
            if (thread._id === reply.threadId) {
                thread.replies.push(reply._id)
            }

            return thread
        })

        app.replies.push(reply)

        app.newReply = ''
        console.log("POSTED REPLY: " + reply._id)
    }
})