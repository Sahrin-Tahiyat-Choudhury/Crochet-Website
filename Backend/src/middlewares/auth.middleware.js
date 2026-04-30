const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

async function authAdmin(req, res, next) {
    const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message: "Unauthorized"});
        }
    
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if(decoded.role !== "admin"){
                return res.status(403).json({message: "You don't have access"});
            }

            req.user = decoded;

            next();
        }catch(err){
            console.log(err);
            return res.status(401).json({message: "Unauthorized"});
        }   
    }

async function authUserAndAdmin(req, res, next) {
    const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message: "Token not provided"});
        }
    
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ 
        token 
    });
    if(isTokenBlacklisted){
        return res.status(401).json({message: "Token is invalid"});
    }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if(decoded.role !== "user" && decoded.role !== "admin"){
                return res.status(403).json({message: "You don't have access"});
            }

            req.user = decoded;

            next();
        }catch(err){
            console.log(err);
            return res.status(401).json({message: "Invalid token"});
        }   
}

async function authUser(req, res, next) {
    const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message: "Token not provided"});
        }
    
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ 
        token 
    });
    if(isTokenBlacklisted){
        return res.status(401).json({message: "Token is invalid"});
    }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if(decoded.role !== "user" ){
                return res.status(403).json({message: "You don't have access"});
            }

            req.user = decoded;

            next();
        }catch(err){
            console.log(err);
            return res.status(401).json({message: "Invalid token"});
        }   
}

    module.exports = { authAdmin,authUserAndAdmin, authUser }