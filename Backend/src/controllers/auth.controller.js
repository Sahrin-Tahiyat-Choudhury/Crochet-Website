const userModel = require('../models/user.model');
const validationRules = require('../middlewares/validation.middleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const tokenBlacklistModel = require('../models/blacklist.model');

async function registerUser(req, res) {
    const { username, email, password, role = "user" } = req.body;
    
    const userAlreadyExists = await userModel.findOne ({
        $or: [
            { username },
            { email }
        ]
    })

    if (userAlreadyExists) {
        return res.status(409).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash,
        role
    })

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,    
            email: user.email,
            role: user.role
        }
    })
}

async function loginUser(req, res) {
    const { username,email, password } = req.body;

    const user = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}

async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if(token){
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token");
    res.status(200).json({
        message: "User logged out successfully"
    });
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}

async function getAllUsersController(req, res) {
    try{
        const users = await userModel.find()
            .skip(0)
            .limit(5)
            .select("username email role");

        res.status(200).json({ users: users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
}
module.exports = { registerUser, loginUser, logoutUserController, getMeController, getAllUsersController };