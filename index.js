const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
// const path = require('path')
const cookieParser = require('cookie-parser')
const TodoModel = require('./Models/Todo')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const EmployeeModel = require('./Models/Employee')
const PORT = process.env.PORT || 8080

const app = express()
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
// app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

mongoose.connect('mongodb://127.0.0.1:27017/test')

app.get('/', (req,res) => {
    res.status(200).json({OK:"Succesful ping"})
})

app.post('/register', (req,res) => {
    // EmployeeModel.create(req.body)
    // .then(employees => res.json(employees))
    // .catch(err => res.json(err))
    const {name, email, password} = req.body;
    bcrypt.hash(password, 10)
    .then(hash => {
        EmployeeModel.create({name, email, password: hash})
        .then(employees => res.json("Success"))
        .catch(err => res.json(err))
    }).catch(err => res.json(err))
})

app.post('/login', (req,res) => {
    const {email, password} = req.body;
    EmployeeModel.findOne({email: email})
    .then(user => {
        if(user) {
            bcrypt.compare(password, user.password, (err, response) => {
                if(response) {
                    //JWT creation
                    const accessToken = jwt.sign(
                        {email: user.email},
                        process.env.ACCESS_TOKEN_SECRET,
                        {expiresIn: '30s'}
                    );
                    const refreshToken = jwt.sign(
                        {email: user.email},
                        process.env.REFRESH_TOKEN_SECRET,
                        {expiresIn: '1y'}
                    ); 
                    //res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24*60*60*1000});
                    res.json({message:"Success", accessToken: accessToken, refreshToken: refreshToken, userId: user._id})
                }
                else {
                    res.json("The password is incorrect")
                }
            })
        }
        else {
            res.json("No record existed")
        }
    }).catch(err => res.json(err))
})

app.get('/get', (req,res) => {
    const employeeId = req.query.userId; //const employeeId = localStorage.getItem('userId'); In the code, localStorage.getItem('userId') is attempting to retrieve the 'userId' value from the browser's local storage. However, localStorage is not available in the server-side code. Local storage is a client-side feature and cannot be accessed directly from the server. To pass the user ID to the server-side code, you typically send it as part of the request, either as a query parameter, request header, or in the request body.
    TodoModel.find({employeeId: employeeId})
    .then(result => res.json(result))
    .catch(err => res.json(err))
})

app.put('/update/:id', (req, res) => {
    const {id} = req.params;
    TodoModel.findByIdAndUpdate({_id: id}, {done: true})
    .then(result => res.json(result))
    .catch(err => res.json(err))
})

app.delete('/delete/:id', (req, res) => {
    const {id} = req.params;
    TodoModel.findByIdAndDelete({_id: id})
    .then(result => res.json(result))
    .catch(err => res.json(err))
})

app.post('/add', upload.single('image'), (req, res) => {

    const task = req.body.task;
    const desc = req.body.desc;
    const imageUrl = req.file.path;
    const employeeId = req.body.employeeId;
    
    TodoModel.create({
        task : task,
        desc : desc,
        imageUrl : imageUrl,
        employeeId : employeeId
    })
    .then(result => res.json(result))
    .catch(err => res.json(err))
})

app.listen(PORT, () => {
    console.log("Server is running")
})
