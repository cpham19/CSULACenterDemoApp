const socket = io()

const headerComponent = {
    template: `<div>
                    <div class="header-left">
                        <img src="/img/csula-logo.png" class="logo" width="100px" height="100px">
                    </div>
    
                    <div class="header-right">
                        <button v-show="state !== 'Home'" v-on:click="$emit('change', 'Home')" class="btn btn-primary" type="submit">Home</button>
                        <button v-show="state === 'Home'" v-on:click="$emit('change', 'Home')" class="btn btn-danger" type="submit">Home</button>
                        <button v-show="state !== 'Courses'" v-on:click="$emit('change', 'Courses')" class="btn btn-primary" type="submit">Courses</button>
                        <button v-show="state === 'Courses'" v-on:click="$emit('change', 'Courses')" class="btn btn-danger" type="submit">Courses</button>
                        <button v-show="state !== 'Assignments'" v-on:click="$emit('change', 'Assignments')" class="btn btn-primary"
                            type="submit">Assignments</button>
                        <button v-show="state === 'Assignments'" v-on:click="$emit('change', 'Assignments')" class="btn btn-danger"
                            type="submit">Assignments</button>
                        <button v-show="state !== 'Forums'" v-on:click="$emit('change', 'Forums')" class="btn btn-primary" type="submit">Forums</button>
                        <button v-show="state === 'Forums'" v-on:click="$emit('change', 'Forums')" class="btn btn-danger" type="submit">Forums</button>
                    </div>
                </div>`,
    props: ['state']
}

const homeComponent = {
    template:  `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <h1 class="display-4">User Information</h1>

                        <h2 class="display-4">Full Name</h2>
                        <p class="lead">{{me.firstName}} {{me.lastName}}</p>

                        <h2 class="display-4">Address</h2>
                        <p class="lead">{{me.streetAddress}}, {{me.city}} {{me.state}} {{me.zipCode}}</p>

                        <h2 class="display-4">Email</h2>
                        <p class="lead">{{me.email}}</p>   
                        
                        <h2 class="display-4">Phone Number</h2>
                        <p class="lead">{{me.phoneNumber}}</p>
                    </div>
                </div>`,
    props: ['me']
}


const courseButtonsComponent = {
    template: `<div class="courseRow">
                    <div class="column">
                        <button class="block" v-on:click="$emit('change', 'search')" type="submit">Search Courses</button>
                    </div>
                    <div class="column" v-show="me.admin">
                        <button class="block" v-on:click="$emit('change', 'add')" type="submit">Add Course</button>
                    </div>
                    <div class="column">
                        <button class="block" v-on:click="$emit('change', 'drop')" type="submit">Drop Course</button>
                    </div>
                    <div class="column" v-show="me.admin">
                        <button class="block" v-on:click="$emit('change', 'remove')" type="submit">Remove Course</button>
                    </div>
                    <div class="column" v-show="me.admin">
                        <button class="block" v-on:click="$emit('change', 'edit')" type="submit">Edit Course</button>
                    </div>
                </div>`,
    props: ['me']
}

const searchedCoursesComponent = {
    template: `<div>
                    <ul v-for="course in courses">
                        <li>
                            <div class="jumbotron jumbotron-fluid">
                                <div class="container-fluid">
                                    <h1 class="display-4">{{course.dept}} {{course.number}}-{{course.section}}</h1>

                                    <h2 class="display-4">Name</h2>
                                    <p class="lead">{{course.name}}</p>

                                    <h2 class="display-4">Description</h2>
                                    <p class="lead">{{course.description}}</p>

                                    <h2 class="display-4">Professor</h2>
                                    <p class="lead">{{course.prof}}</p>

                                    <h2 class="display-4">Room</h2>
                                    <p class="lead">{{course.room}}</p>

                                    <button v-show="!me.admin" v-on:click="$emit('enroll', course._id)" class="btn-small waves-effect waves-light" type="submit">Enroll</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>`,
    props: ['courses', 'me']
}

const addCourseComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <select class="browser-default" v-model="dept">
                            <option disabled value="">course dept</option>
                            <option>CS</option>
                            <option>ME</option>
                            <option>BIOL</option>
                            <option>PHYS</option>
                            <option>CHEM</option>
                            <option>COMM</option>
                            <option>CE</option>
                        </select>

                        <input v-model="name" placeholder="course name" type="text">
                        <input v-model="number" placeholder="course number" type="text">
                        <input v-model="section" placeholder="course section" type="text">
                        <textarea v-model="description" placeholder="course description"></textarea>
                        <input v-model="unit" placeholder="course unit" type="text">
                        <input v-model="prof" placeholder="course professor" type="text">
                        <input v-model="room" placeholder="course room" type="text">
                        <button v-on:click="$emit('add', dept, name, number, section, description, unit, prof, room)" class="btn-small waves-effect waves-light" type="submit">Add</button>
                        <button v-on:click="$emit('discard')" class="btn-small waves-effect waves-light" type="submit">Discard</button>
                        <div v-show="failed">{{error}}</div>
                    </div>
                </div>`,
    props: ['dept', 'name', 'number', 'section', 'description', 'unit', 'prof', 'room', 'failed', 'error']
}


const removeCourseComponent = {
    template: `<div>
                    <ul v-for="course in courses">
                        <li>
                            <div class="jumbotron jumbotron-fluid">
                                <div class="container-fluid">
                                    <h1 class="display-4">{{course.dept}} {{course.number}}-{{course.section}}</h1>

                                    <h2 class="display-4">Name</h2>
                                    <p class="lead">{{course.name}}</p>

                                    <h2 class="display-4">Description</h2>
                                    <p class="lead">{{course.description}}</p>

                                    <h2 class="display-4">Professor</h2>
                                    <p class="lead">{{course.prof}}</p>

                                    <h2 class="display-4">Room</h2>
                                    <p class="lead">{{course.room}}</p>
                                    
                                    <button v-on:click="$emit('remove', course._id)" class="btn-small waves-effect waves-light" type="submit">Remove</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>`,
    props: ['courses']
}

const dropCourseComponent = {
    template: `<div>
                    <ul v-for="courseId in me.courses">
                        <template v-for="course in courses">
                            <li v-show="courseId === course._id">
                                <div class="jumbotron jumbotron-fluid">
                                    <div class="container-fluid">
                                        <h1 class="display-4">{{course.dept}} {{course.number}}-{{course.section}}</h1>

                                        <h2 class="display-4">Name</h2>
                                        <p class="lead">{{course.name}}</p>

                                        <h2 class="display-4">Description</h2>
                                        <p class="lead">{{course.description}}</p>

                                        <h2 class="display-4">Professor</h2>
                                        <p class="lead">{{course.prof}}</p>

                                        <h2 class="display-4">Room</h2>
                                        <p class="lead">{{course.room}}</p>

                                        <button v-on:click="$emit('drop', courseId)" class="btn-small waves-effect waves-light" type="submit">Drop</button>
                                    </div>
                                </div>
                            </li>
                        </template>
                    </ul>
                </div>`,
    props: ['me', 'courses']
}

const editCourseComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <select class="browser-default" v-model="course">
                            <option disabled value="">Choose your course to edit</option>
                            <option v-for="courseObj in courses" v-bind:value="courseObj">{{courseObj.dept}}{{courseObj.number}}-{{courseObj.section}}-{{courseObj.name}}</option>
                        </select>
                        <div v-show="course.dept">
                            <select class="browser-default" v-model="course.dept">
                                    <option disabled value="">Choose your course to edit</option>
                                    <option>CS</option>
                                    <option>ME</option>
                                    <option>BIOL</option>
                                    <option>PHYS</option>
                                    <option>CHEM</option>
                                    <option>COMM</option>
                                    <option>CE</option>
                            </select>
                            <input v-model="course.name" placeholder="course name" type="text">
                            <input v-model="course.number" placeholder="course number" type="text">
                            <input v-model="course.section" placeholder="course section" type="text">
                            <textarea v-model="course.description" placeholder="course description"></textarea>
                            <input v-model="course.unit" placeholder="course unit" type="text">
                            <input v-model="course.prof" placeholder="course professor" type="text">
                            <input v-model="course.room" placeholder="course room" type="text">
                            <button v-on:click="$emit('edit', course)" class="btn-small waves-effect waves-light" type="submit">Edit</button>
                            <button v-on:click="$emit('back')" class="btn-small waves-effect waves-light" type="submit">Back</button>
                            <div v-show="failed">{{error}}</div>
                        </div>
                    </div>
                </div>`,
    props: ['course', 'courses', 'failed', 'error']
}


const courseComponent = {
    template: `<div class="course-list">
                    <h4 align="center">Current Courses</h4>
                    <hr />
                    <ul v-for="courseId in me.courses">
                        <li v-for="courseObj in courses" v-show="courseId === courseObj._id">
                            <p>{{courseObj.dept}} {{courseObj.number}}-{{courseObj.section}}<br />
                                {{courseObj.name}}<br />
                                {{courseObj.prof}} {{courseObj.room}}<br />
                            </p>
                        </li>
                        <hr />
                    </ul>
                </div>`,
    props: ['me', 'courses']
}


const assignmentComponent = {
    template: `<div>
                    <div v-show="me.admin">
                        <template v-for="course in courses">
                            <div class="jumbotron jumbotron-fluid">
                                <div class="container-fluid">
                                    <h1 class="display-4">{{course.dept}}{{course.number}}-{{course.section}} {{course.name}} <button v-show="course.prof === me.name" v-on:click="$emit('add', course)"
                                            class="btn-small waves-effect waves-light" type="submit">+</button></h1>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Assignment</th>
                                                <th>Due Date</th>
                                                <th v-show="course.prof === me.name">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="assignment in assignments">
                                                <td v-show="assignment.courseId === course._id">
                                                    <a v-on:click="$emit('view', assignment)">{{assignment.title}}</a>
                                                </td>
                                                <td v-show="assignment.courseId === course._id">
                                                    <p class="lead">{{assignment.dueDate}}</p>
                                                </td>
                                                <td v-show="assignment.courseId === course._id">
                                                    <button v-show="course.prof === me.name" v-on:click="$emit('edit', assignment)" class="button-align-left"
                                                        type="submit">Edit</button>
                                                    <button v-show="course.prof === me.name" v-on:click="$emit('remove', assignment)" class="button-align-left" type="submit">Remove</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div v-show="!me.admin">
                        <template v-for="courseId in me.courses">
                            <template v-for="course in courses">
                                <div class="jumbotron jumbotron-fluid" v-show="courseId === course._id">
                                    <div class="container-fluid">
                                        <h1 class="display-4">{{course.dept}}{{course.number}}-{{course.section}} {{course.name}} <button v-show="course.prof === me.name" v-on:click="$emit('add', course)"
                                                class="btn-small waves-effect waves-light" type="submit">+</button></h1>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Assignment</th>
                                                    <th>Due Date</th>
                                                    <th v-show="course.prof === me.name">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="assignment in assignments">
                                                    <td v-show="assignment.courseId === course._id">
                                                        <a v-on:click="$emit('view', assignment)">{{assignment.title}}</a>
                                                    </td>
                                                    <td v-show="assignment.courseId === course._id">
                                                        <p class="lead">{{assignment.dueDate}}</p>
                                                    </td>
                                                    <td v-show="assignment.courseId === course._id">
                                                        <button v-show="course.prof === me.name" v-on:click="$emit('edit', assignment)" class="button-align-left"
                                                            type="submit">Edit</button>
                                                        <button v-show="course.prof === me.name" v-on:click="$emit('remove', assignment)" class="button-align-left" type="submit">Remove</button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>`,
    props: ['me', 'courses', 'assignments']
}

const addAssignmentComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <h1 class="display-4">Adding assignment to
                            {{course.dept}}{{course.number}}-{{course.section}}
                            {{course.name}}
                        </h1>
                        <input v-model="date" type="date" placeholder="select a due date">
                        <input v-model="title" placeholder="title of assignment" type="text">
                        <textarea v-model="description" placeholder="description of assignment"></textarea>
                        <button v-on:click="$emit('post', course._id, date, title, description)"
                            class="btn-small waves-effect waves-light" type="submit">Post</button>
                        <div v-show="failed">{{error}}</div>
                    </div>
                </div>`,
    props: ['course', 'date', 'title', 'description', 'failed', 'error']
}

const editAssignmentComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <input v-model="assignment.title" placeholder="title of assignment" type="text">
                        <textarea v-model="assignment.description" placeholder="description of assignment"></textarea>
                        <button v-on:click="$emit('edit', assignment)" class="btn-small waves-effect waves-light" type="submit">Submit</button>
                        <button v-on:click="$emit('back')" class="btn-small waves-effect waves-light" type="submit">Back</button>
                        <div v-show="failed">{{error}}</div>
                    </div>
                </div>`,
    props: ['assignment', 'failed', 'error']
}

const viewAssignmentComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <button v-on:click="$emit('back')" type="submit">Back</button>
                        <h1 class="display-4">{{assignment.title}}</h1>
                        <p class="lead">Due Date: {{assignment.dueDate}}</p>
                        <p class="lead">{{assignment.description}}</p>
                    </div>
                </div>`,
    props: ['assignment',]
}

const forumComponent = {
    template: `<div>
                    <template v-for="course in courses">
                        <div class="jumbotron jumbotron-fluid">
                            <div class="container-fluid">
                                <h1 class="display-4">{{course.dept}}{{course.number}}-{{course.section}} {{course.name}} <button v-on:click="$emit('create', course)"
                                        class="btn-small waves-effect waves-light" type="submit">+</button></h1>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Thread</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="thread in threads">
                                            <td v-show="thread.courseId === course._id"><a v-on:click="$emit('view', thread)">{{thread.title}}</a></td>
                                            <td v-show="thread.courseId === course._id"><p class="lead">{{thread.date}}</p></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </template>
                </div>`,
    props: ['courses', 'threads', 'me']
}

const addThreadComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <h1 class="display-4">Adding thread to
                            {{course.dept}}{{course.number}}-{{course.section}} {{course.name}}
                        </h1>
                        <input v-model="title" placeholder="title of thread" type="text">
                        <textarea v-model="description" placeholder="description of thread"></textarea>
                        <button v-on:click="$emit('post', course._id, me, title, description)" class="btn-small waves-effect waves-light" type="submit">Post</button>
                        <div v-show="failed">{{error}}</div>
                    </div>
                </div>`,
    props: ['course', 'title', 'description', 'me', 'failed', 'error']
}

const editThreadComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <input v-model="thread.title" placeholder="title of thread" type="text">
                        <textarea v-model="thread.description" placeholder="description of thread"></textarea>
                        <button v-on:click="$emit('edit', thread)" class="btn-small waves-effect waves-light" type="submit">Submit</button>
                        <button v-on:click="$emit('back')" class="btn-small waves-effect waves-light" type="submit">Back</button>
                        <div v-show="failed">{{error}}</div>
                    </div>
                </div>`,
    props: ['thread', 'failed', 'error']
}

const editReplyComponent ={
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid-fluid">
                        <textarea v-model="reply.description" placeholder="description of reply"></textarea>
                        <button v-on:click="$emit('edit_reply', reply)" class="btn-small waves-effect waves-light" type="submit">Submit</button>
                        <button v-on:click="$emit('back')" class="btn-small waves-effect waves-light" type="submit">Back</button>
                        <div v-show="failed">{{error}}</div>
                    </div>
                </div>`,
    props: ['reply', 'failed', 'error']
}

const threadComponent = {
    template: `<div class="jumbotron jumbotron-fluid">
                    <div class="container-fluid">
                        <button v-on:click="$emit('back_thread')" type="submit">Back</button>
                        <br />
                        <br />

                        <div>
                            <h1 class="display-4">{{thread.title}}</h1>
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
                                        <td class="post-description">{{thread.description}}</td>
                                        <td class="post-author">
                                            {{thread.date}}<br/>
                                            <img :src="thread.authorAvatar" width="60px" height="60px"><br/>
                                            {{thread.authorName}}<br/>
                                            <button v-show="(thread.authorName === me.name || me.admin) && !editting_thread" v-on:click="$emit('toggle_edit_thread', thread)" type="submit">Edit</button><br/>
                                            <button v-show="(thread.authorName === me.name || me.admin) && !editting_thread"" v-on:click="$emit('remove', thread)" type="submit">Remove</button>
                                        </td>
                                    </tr>

                                    <!-- Additional rows for replies and their authors -->
                                    <tr v-for="reply in replies">
                                        <td class="post-description" v-show="reply.threadId === thread._id">{{reply.description}}</td>
                                        <td class="post-author" v-show="reply.threadId === thread._id">
                                            {{reply.date}}<br/>
                                            <img :src="reply.authorAvatar" width="60px" height="60px"><br/>
                                            {{reply.authorName}}<br />
                                            <button v-show="reply.authorName === me.name || me.admin" v-on:click="$emit('toggle_edit_reply', reply)" type="submit"
                                                v-show="!editting_reply">Edit</button><br/>
                                            <button v-show="reply.authorName === me.name || me.admin" v-on:click="$emit('delete', reply)" type="submit"
                                                v-show="!editting_reply">Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <br />

                            <!-- For creating a new reply to a thread -->
                            <textarea v-model="new_reply" placeholder="description of reply"></textarea>
                            <button v-on:click="$emit('reply', thread, me, new_reply)">Reply</button>
                            <div v-show="failed">{{error}}</div>
                        </div>
                    </div>
                </div>`,
    props: ['replies', 'thread', 'editting_thread', 'editting_reply', 'new_reply', 'me', 'failed', 'error']
}

const app = new Vue({
    el: '#demo-app',
    data: {
        loggedIn: false,
        signingUp: false,
        firstName: '',
        lastName: '',
        streetAddress: '',
        city: '',
        stateLocation: '',
        zipCode: '',
        email: '',
        phoneNumber: '',
        states: ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS",
            "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR",
            "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"],
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
        search: false,
        add: false,
        drop: false,
        remove: false,
        edit: false,
        searchedCourses: [],
        addingAssignment: false,
        edittingAssignment: false,
        courseOfAssignmentToAdd: {},
        assignmentDueDate: '',
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
        failedAdding: false,
        failedEditting: false,
        error: "No Empty spaces!",
    },
    methods: {
        handler: function handler(event) { },
        joinUser: function () {
            // Reject if user doesn't put name or password
            if (!this.userName.replace( /\s/g, '') || !this.password.replace( /\s/g, '')) {
                return
            }

            socket.emit('join-user', this.userName, this.password)
        },
        toggleSignup: function () {
            this.signingUp = true
            this.userName = ''
            this.password = ''
        },
        backOutSigningUp: function () {
            this.signingUp = false
            this.firstName = ''
            this.lastName = ''
            this.streetAddress = ''
            this.city = ''
            this.stateLocation = ''
            this.zipCode = ''
            this.email = ''
            this.phoneNumber = ''
            this.userName = ''
            this.password = ''
        },
        signupUser: function () {
            // Reject if user doesn't put name or password
            if (!this.firstName.replace( /\s/g, '') || !this.lastName.replace( /\s/g, '') || !this.streetAddress.replace( /\s/g, '') || !this.city.replace( /\s/g, '') || !this.stateLocation.replace( /\s/g, '') || !this.zipCode.replace( /\s/g, '') || !this.email.replace( /\s/g, '') || !this.phoneNumber.replace( /\s/g, '') || !this.userName.replace( /\s/g, '') || !this.password.replace( /\s/g, '')) {
                this.failedAdding = true
                return
            }

            this.failedAdding = false

            socket.emit('create-user', this.firstName, this.lastName, this.streetAddress, this.city, this.zipCode, this.stateLocation, this.email, this.phoneNumber, this.userName, this.password, this.admin)
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
        addCourse: function (dept, name, number, section, description, unit, prof, room) {
            if (!dept.replace( /\s/g, '') || !name.replace( /\s/g, '') || !number.replace( /\s/g, '') || !section.replace( /\s/g, '') || !description.replace( /\s/g, '') || !unit.replace( /\s/g, '') || !prof.replace( /\s/g, '') || !room.replace( /\s/g, '')) {
                this.failedAdding = true
                return
            }

            this.failedAdding = false

            const course = { dept: dept, name: name, number: number, section: section, description: description, unit: unit, prof: prof, room: room }

            socket.emit('add-course', course)
        },
        searchCourse: function (dept, number) {
            // If courseDept is empty, do nothing
            if (!dept.replace( /\s/g, '') || (!dept.replace( /\s/g, '') && !number.replace( /\s/g, ''))) {
                return
            }

            this.searchedCourses = []

            // Filter the complete list of courses in database
            // If user only selected a department OR
            // If user selected a department and typed a course number
            this.searchedCourses = this.courses.filter(course => {
                if (course.dept === dept && !number) {
                    return course
                }
                else if (course.dept === dept && course.number.toString().includes(number.toString())) {
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
            if (!newCourse.dept.replace( /\s/g, '') || !newCourse.name.replace( /\s/g, '') || !newCourse.section.replace( /\s/g, '') || !newCourse.description.replace( /\s/g, '') || !newCourse.unit.replace( /\s/g, '') || !newCourse.prof.replace( /\s/g, '') || !newCourse.room.replace( /\s/g, '')) {
                this.failedEditting = true
                return
            }

            this.failedEditting = false

            socket.emit('edit-course', newCourse)
        },
        backOutEdittingCourse: function () {
            this.edit = false
        },
        addAssignment: function (course) {
            this.addingAssignment = true
            this.edittingAssignment = false
            this.courseOfAssignmentToAdd = JSON.parse(JSON.stringify(course))
        },
        postAssignment: function (courseId, date, assignmentTitle, assignmentDescription) {
            if (!date.replace( /\s/g, '') || !assignmentTitle.replace( /\s/g, '') || !assignmentDescription.replace( /\s/g, '')) {
                this.failedAdding = true
                return
            }

            this.failedAdding = false

            const year = date.substring(0, 4)
            const month = date.substring(5,7)
            const day = date.substring(8, 10)

            const formattedDate = month + "/" + day + "/" + year

            const assignment = {dueDate: formattedDate, title: assignmentTitle, description: assignmentDescription }
            socket.emit('post-assignment', courseId, assignment)
        },
        removeAssignment: function (assignment) {
            socket.emit('remove-assignment', assignment)
        },
        selectAssignmentToEdit: function (assignment) {
            this.addingAssignment = false
            this.edittingAssignment = true
            this.newAssignment = JSON.parse(JSON.stringify(assignment))
        },
        editAssignment: function (assignment) {
            if (!assignment.title.replace( /\s/g, '') || !assignment.description.replace( /\s/g, '')) {
                this.failedEditting = true
                return
            }

            this.failedEditting = false

            socket.emit('edit-assignment', assignment)
        },
        backOutEdittingAssignment: function () {
            this.edittingAssignment = false
        },
        createThread: function (course) {
            this.addingThread = true
            this.edittingThread = false
            this.courseOfThreadToAdd = course
        },
        postThread: function (courseId, author, threadTitle, threadDescription) {
            if (!threadTitle.replace( /\s/g, '') || !threadDescription.replace( /\s/g, '')) {
                this.failedAdding = true
                return
            }

            this.failedAdding = false

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
            this.newThread = JSON.parse(JSON.stringify(thread))
        },
        editThread: function (thread) {
            if (!thread.title.replace( /\s/g, '') || !thread.description.replace( /\s/g, '')) {
                this.failedEditting = true
                return
            }

            this.failedEditting = false

            this.threadToView = JSON.parse(JSON.stringify(thread))

            socket.emit('edit-thread', thread)
        },
        backOutEdittingThread: function () {
            this.edittingThread = false
        },
        viewAssignment: function (assignment) {
            this.viewingAssignment = true
            this.assignmentToView = JSON.parse(JSON.stringify(assignment))
        },
        backOutAssignment: function () {
            this.viewingAssignment = false
            this.assignmentToView = {}
        },
        viewThread: function (thread) {
            this.viewingThread = true
            this.threadToView = JSON.parse(JSON.stringify(thread))
        },
        backOutThread: function () {
            this.viewingThread = false
            this.threadToView = {}
        },
        replyToThread: function (threadId, author, newReply) {
            if (!newReply || !newReply.replace( /\s/g, '')) {
                this.failedAdding = true
                return
            }

            this.failedEditting = false

            const modifiedAuthor = { name: author.name, avatar: author.avatar }

            const reply = { threadId: threadId, author: modifiedAuthor, description: newReply }
            socket.emit('reply-thread', reply)
        },
        editReply: function (reply) {
            this.edittingReply = true
            this.replyToEdit = JSON.parse(JSON.stringify(reply))
        },
        backOutEdittingReply: function () {
            this.edittingReply = false
        },
        postEdittedReply: function (reply) {
            if (!reply.description.replace( /\s/g, '')) {
                this.failedEditting = true
                return
            }

            this.failedEditting = false

            socket.emit('edit-reply', reply)
        },
        deleteReply: function (reply) {
            socket.emit('delete-reply', reply)
        }
    },
    components: {
        'header-component': headerComponent,
        'home-component': homeComponent,
        'course-row-component': courseButtonsComponent,
        'course-component': courseComponent,
        'searched-courses-component': searchedCoursesComponent,
        'add-course-component': addCourseComponent,
        'drop-course-component': dropCourseComponent,
        'edit-course-component': editCourseComponent,
        'remove-course-component': removeCourseComponent,
        'assignment-component': assignmentComponent,
        'add-assignment-component': addAssignmentComponent,
        'edit-assignment-component': editAssignmentComponent,
        'view-assignment-component': viewAssignmentComponent,
        'forum-component': forumComponent,
        'add-thread-component': addThreadComponent,
        'edit-thread-component': editThreadComponent,
        'edit-reply-component': editReplyComponent,
        'thread-component': threadComponent,
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

        console.log("ENROLLED THE COURSE: " + courseId)
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
        app.courseOfAssignmentToAdd.title = {}
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

        app.viewingThread = false


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
