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
        postingAssignment: false,
        assignmentOfCourseToEdit: '',
        assignmentTitle: '',
        assignmentDescription: '',
        newCourse: '',
        newAssignment: '',
        courseOfAssignmentToEdit: ''
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

            socket.emit('add-course', this.courseDept, this.courseName, this.courseNumber, this.courseSection, this.courseDescription, this.courseUnit, this.courseProf, this.courseRoom)
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
            if (!newCourse) {
                return
            }
            socket.emit('edit-course', newCourse)
        },
        addAssignment: function (course) {
            this.addingAssignment = true
            this.edittingAssignment = false
            this.assignmentOfCourseToEdit = course
        },
        postAssignment: function (course, assignmentTitle, assignmentDescription) {
            this.addingAssignment = false
            this.assignmentOfCourseToEdit = ''

            const assignment = {title: assignmentTitle, description: assignmentDescription}
            socket.emit('post-assignment', course, assignment)
        },
        removeAssignment: function (course, assignment) {
            socket.emit('remove-assignment', course, assignment)
        },
        selectAssignmentToEdit: function (course, assignment) {
            this.addingAssignment = false
            this.edittingAssignment = true
            this.newAssignment = assignment
            this.courseOfAssignmentToEdit = course
        },
        editAssignment: function (course, assignment) {
            this.addingAssignment = false
            this.edittingAssignment = false
            socket.emit('edit-assignment', course, assignment)
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

// Successfully join (change screen)
socket.on('successful-join', user => {
    if (app.userName === user.name) {
        app.me = user
        app.loggedIn = true
        app.failed = ''
        app.password = ''
    }

    app.users.push(user)
})

// Failed to join because username exists
socket.on('failed-join', obj => {
    if (obj.name === app.userName) {
        app.failedName = obj.name
    }
})

// Added course
socket.on('successful-add-course', courseObj => {
    console.log("ADDED THE COURSE: " + courseObj._id)
    app.courseDept = ''
    app.courseName = ''
    app.courseNumber = ''
    app.courseSection = ''
    app.courseDescription = ''
    app.courseUnit = ''
    app.courseProf = ''
    app.courseRoom = ''
    app.courses.push(courseObj)
})

// Added course
socket.on('successful-enroll-course', courseId => {
    console.log("ENROLLED THE COURSE: " + courseId)
    app.me.courses.push(courseId)

    // Filter the search results after enrolling a course
    app.searchedCourses = app.searchedCourses.filter(courseObj => !(courseObj._id === courseId))
})

// Dropped course
socket.on('successful-drop-course', courseId => {
    console.log("DROPPED THE COURSE: " + courseId)
    app.me.courses = app.me.courses.filter(courseObj => !(courseObj === courseId))
})

// Remove course
socket.on('successful-remove-course', courseId => {
    console.log("REMOVED THE COURSE: " + courseId)
    app.courses = app.courses.filter(courseObj => !(courseObj._id === courseId))
})

// Edit course
socket.on('successful-edit-course', course => {
    console.log("EDITTED THE COURSE: " + courseId)
    app.courses = app.courses.map(courseObj => {
        if (courseObj._id === course._id) {
            courseObj = course
            return courseObj
        }
        else {
            return courseObj
        }
    })

    app.newCourse = ''
})

// Remove course
socket.on('successful-edit-assignment', obj => {
    console.log(obj)
})

// Remove assignemnt
socket.on('successful-remove-assignment', obj => {
    console.log("REMOVED THE ASSIGNMENT: " + obj._id)
    app.courses = app.courses.map(courseObj => {
        if (courseObj._id === obj.course._id) {
            courseObj.assignments = courseObj.assignments.filter(assignment => !(assignment.id === obj.assignment.id))

            return courseObj
        }
        else {
            return courseObj
        }
    })
})


// Posted assignment
socket.on('successful-post-assignment', obj => {
    console.log("POSTED THE ASSIGNMENT: " + obj._id)
    app.courses = app.courses.map(courseObj => {
        if (courseObj._id === obj.course._id) {
            courseObj.assignments.push(obj.assignment)
            return courseObj
        }
        else {
            return courseObj
        }
    })

    app.assignmentTitle = ''
    app.assignmentDescription = ''
})