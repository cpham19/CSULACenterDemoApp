const socket = io()

const searchedCoursesComponent = {
    template: `<div>
                    <ul v-for="course in courses">
                        <li>
                            <p>{{course.dept}} {{course.number}}-{{course.section}}</p>
                            <p>{{course.name}}</p>
                            <p>{{course.description}}</p>
                            <p>{{course.prof}} {{course.room}}</p>
                            <button v-on:click="$emit('enroll', course._id)" class="btn-small waves-effect waves-light" type="submit">Enroll</button>
                        </li>
                        <hr>
                    </ul>
                </div>`,
    props: ['courses']
}

const dropCourseComponent = {
    template: `<div>
                    <ul v-for="course in courses">
                        <li>
                            <p>{{course.dept}} {{course.number}}-{{course.section}} {{course.name}} <button v-on:click="$emit('remove', course._id)"
                                    class="btn-small waves-effect waves-light" type="submit">Remove</button></p>
                        </li>
                    <hr>
                    </ul>
                </div>`,
    props: ['courses']
}

const removeCourseComponent = {
    template: `<div>
                    <ul v-for="courseId in me.courses">
                        <template v-for="courseObj in courses">
                            <li v-show="courseId === courseObj._id">
                                <p>{{courseObj.dept}} {{courseObj.number}}-{{courseObj.section}}</p>
                                <p>{{courseObj.name}}</p>
                                <p>{{courseObj.prof}} {{courseObj.room}}</p>
                                <button v-on:click="$emit('drop', courseId)" class="btn-small waves-effect waves-light" type="submit">Drop</button>
                            </li>
                        </template>
                        <hr />
                    </ul>
                </div>`,
    props: ['me', 'courses']
}


const assignmentComponent = {
    template: `<div>
                    <template v-for="course in courses">
                        <h1>{{course.dept}}{{course.number}}-{{course.section}} {{course.name}} <button v-on:click="$emit('add', course)"
                                class="btn-small waves-effect waves-light" type="submit">+</button></h1>
                        <table v-show="course.prof === me.name">
                            <thead>
                                <tr>
                                    <th>Assignment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="assignment in assignments">
                                    <td v-show="assignment.courseId === course._id">
                                        <a v-on:click="$emit('view', assignment)">{{assignment.title}}</a>
                                    </td>
                                    <td v-show="assignment.courseId === course._id">
                                        <button v-on:click="$emit('edit', assignment)" class="button-align-left"
                                            type="submit">Edit</button>
                                        <button v-on:click="$emit('remove', assignment)" class="button-align-left" type="submit">Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </template>
                </div>`,
    props: ['me', 'courses', 'assignments']
}


const forumComponent = {
    template: `<div>
                    <template v-for="course in courses">
                        <h1>{{course.dept}}{{course.number}}-{{course.section}} {{course.name}} <button v-on:click="$emit('create', course)"
                                class="btn-small waves-effect waves-light" type="submit">+</button></h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>Thread</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="thread in threads">
                                    <td v-show="thread.courseId === course._id"><a v-on:click="$emit('view', thread)">{{thread.title}}</a></td>
                                    <td v-show="thread.courseId === course._id">
                                        <button v-on:click="$emit('remove', thread)" class="button-align-left" type="submit">Remove</button>
                                        <button v-on:click="$emit('edit', thread)" class="button-align-left" type="submit">Edit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </template>
                </div>`,
    props: ['courses', 'threads']
}

const threadComponent = {
    template: `<div>
                    <strong>{{threadToView.title}}</strong>
                    <br />
                    <table>
                        <thead>
                            <tr>
                                <th>Message</th>
                                <th>Author</th>
                            </tr>
                        </thead>

                        <tbody>
                            <!-- First row is the author and his message -->
                            <tr>
                                <td class="post">{{threadToView.description}}</td>
                                <td class="post"><img :src="threadToView.authorAvatar" width="25px">{{threadToView.authorName}}</td>
                            </tr>

                            <!-- Additional rows for replies and their authors -->
                            <tr v-for="reply in replies">
                                <td class="post" v-show="reply.threadId === threadToView._id && replyToEdit._id === reply._id && edittingReply">
                                    <textarea v-model="replyToEdit.description" placeholder="description of reply"></textarea>
                                    <button v-on:click="postEdittedReply(replyToEdit)" class="btn-small waves-effect waves-light"
                                        type="submit">Submit Changes</button>
                                </td>

                                <td class="post" v-show="reply.threadId === threadToView._id && !edittingReply">{{reply.description}}</td>
                                <td class="post" v-show="reply.threadId === threadToView._id">
                                    <img :src="reply.authorAvatar" width="25px">{{reply.authorName}}<br />
                                    <button v-on:click="editReply(reply)" class="btn-small waves-effect waves-light" type="submit"
                                        v-show="!edittingReply">Edit</button>
                                    <button v-on:click="deleteReply(reply)" class="btn-small waves-effect waves-light" type="submit"
                                        v-show="!edittingReply">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>`,
    props: ['replies', 'thread']
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
        edittingReply: false,
        replyToEdit: {},
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
            if (!this.courseDept || (!this.courseDept && !this.courseNumber)) {
                return
            }

            this.searchedCourses = []

            // Filter the complete list of courses in database
            // If user only selected a department OR
            // If user selected a department and typed a course number
            this.searchedCourses = this.courses.filter(course => {
                if (course.dept === this.courseDept && !this.courseNumber) {
                    return course
                }
                else if (course.dept === this.courseDept && course.number.toString().includes(this.courseNumber.toString())) {
                    return course
                }
            })

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
        removeAssignment: function (assignment) {
            socket.emit('remove-assignment', assignment)
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

            const modifiedAuthor = { name: author.name, avatar: author.avatar }

            const thread = { author: modifiedAuthor, title: threadTitle, description: threadDescription }
            socket.emit('post-thread', courseId, thread)
        },
        removeThread: function (thread) {
            socket.emit('remove-thread', thread)
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

            const modifiedAuthor = { name: author.name, avatar: author.avatar }

            const reply = { threadId: threadId, author: modifiedAuthor, description: newReply }
            socket.emit('reply-thread', reply)
        },
        editReply: function (reply) {
            this.edittingReply = true
            this.replyToEdit = reply
        },
        postEdittedReply: function (reply) {
            socket.emit('edit-reply', reply)
        },
        deleteReply: function (reply) {
            socket.emit('delete-reply', reply)
        }
    },
    components: {
        'searched-courses-component': searchedCoursesComponent,
        'drop-course-component': dropCourseComponent,
        'remove-course-component': removeCourseComponent,
        'assignment-component': assignmentComponent,
        'forum-component': forumComponent,
        'thread-component': threadComponent
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
socket.on('successful-remove-assignment', assignment => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === assignment.courseId) {
                courseObj.assignments = courseObj.assignments.filter(assignmentObj => !(assignmentObj._id === assignment._id))
            }

            return courseObj
        })

        app.assignments = app.assignments.filter(assignmentObj => !(assignmentObj._id === assignment._id))

        console.log("REMOVED THE ASSIGNMENT: " + assignment._id)
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

        app.assignmentTitle = ''
        app.assignmentDescription = ''
        app.assignmentOfCourseToAdd.title = ''
        app.assignmentOfCourseToAdd.description = ''
        app.addingAssignment = false

        console.log("POSTED ASSIGNMENT: " + assignment._id)
    }
})

// Posted forum post
socket.on('successful-post-thread', thread => {
    console.log(thread)
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
socket.on('successful-remove-thread', thread => {
    if (app.userName === app.me.name) {
        app.courses = app.courses.map(courseObj => {
            if (courseObj._id === thread.courseId) {
                courseObj.threads = courseObj.threads.filter(threadId => !(threadId === thread._id))
            }

            return courseObj
        })

        app.threads = app.threads.filter(threadObj => !(threadObj._id === thread._id))


        console.log("REMOVED THE THREAD: " + thread._id)
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
    console.log(reply)
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

// Delete reply
socket.on('successful-delete-reply', reply => {
    if (app.userName === app.me.name) {
        app.threads = app.threads.map(threadObj => {
            if (threadObj._id === reply.threadId) {
                threadObj.replies = threadObj.replies.filter(replyObj => !(replyObj._id === reply._id))
            }

            return threadObj
        })

        app.replies = app.replies.filter(replyObj => !(replyObj._id === reply._id))

        console.log("REMOVED THE REPLY: " + reply._id)
    }
})

// Edit reply
socket.on('successful-edit-reply', reply => {
    console.log(reply)
    if (app.userName === app.me.name) {
        app.replies = app.replies.map(replyObj => {
            if (replyObj._id === reply._id) {
                replyObj = reply
            }

            return replyObj
        })

        app.edittingReply = false
        console.log("EDITTED THE REPLY: " + reply._id)
    }
})
