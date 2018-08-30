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
        state: 'Home',
        courseDept: '',
        courseName: '',
        courseNumber: '',
        courseSection: '',
        courseUnit: '',
        search: true,
        add: false,
        searchedCourses: []
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
            if (state === 'search') {
                this.courseDept = ''
                this.courseNumber = ''
                this.search = true
                this.add = false
            }
            else if (state === 'add') {
                this.courseDept = ''
                this.courseNumber = ''
                this.search = false
                this.add = true
            }
        },
        addCourse: function () {
            socket.emit('add-course', this.courseDept, this.courseName, this.courseNumber, this.courseSection, this.courseUnit)
        },
        searchCourse: function () {
            // If courseDept is empty, do nothing
            // If both are empty, do nothing
            if (!this.courseDept || (!this.courseDept && !this.courseNumber)) {
                return
            }

            // Clear after every search
            this.searchedCourses = []

            this.courses.forEach((course) => {
                if (course.dept === this.courseDept && !this.courseNumber) {
                    this.searchedCourses.push(course)
                }
                else if (course.dept === this.courseDept && course.number == this.courseNumber) {
                    this.searchedCourses.push(course)
                }
            })

        },
        enrollCourse: function (course) {
            var found = false
            this.me.courses.forEach(courseObj => {
                if (courseObj.dept === course.dept && courseObj.number == course.number && courseObj.section == course.section) {
                    found = true
                }
            })

            if (found) {
                return
            }
            socket.emit('enroll-course', this.me.name, course)
        },
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
    app.courseDept = ''
    app.courseName = ''
    app.courseNumber = ''
    app.courseSection = ''
    app.courseUnit = ''
    app.courses.push(courseObj)
})

// Added course
socket.on('successful-enroll-course', course => {
    app.me.courses.push(course)
})