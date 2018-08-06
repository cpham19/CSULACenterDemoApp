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
        me: {},
        users: [],
    },
    created: function () {
        // Unload resources after closing tab or browser
        document.addEventListener('beforeunload', this.handler)
    }, methods: {
        handler: function handler(event) { }
    },
    methods: {
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
    },
    components: {
    }
})

// Client Side Socket Event

// Refresh userlist
socket.on('refresh-users', users => {
    users.sort((a,b) => {
        return b.score - a.score
    })
    app.users = users
})

// Successfully join (change screen)
socket.on('successful-join', user => {
    if (app.userName === user.name) {
        app.me = user
        app.loggedIn = true
        app.failed = ''
        app.password = ''
        app.admin = user.admin
    }
        
    app.users.push(user)
})

// Failed to join because username exists
socket.on('failed-join', obj => {
    if (obj.name === app.userName)
        app.failedName = obj.name
})