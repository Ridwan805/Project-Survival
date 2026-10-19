
import { Head } from "../models/ship_head.js";

const registerUser = async (req, res) => {

    try {
        const {head_id,
            email,
            password
        } = req.body;

        if (!head_id || !email || !password) {
            return res.status(400).json({message: "You must fill the required fields."});
        }
        // We can also check the length of the password and all

        if (password.length < 8) {
            return res.status(400).json({message: "Minimum length does not match"});
        }

        if (head_id.trim().length < 6 || head_id.trim().length > 35) {
            return res.status(400).json({message: "Enter valid id"});
        }

        // Find existing user if there is one

        const existing_user = await Head.findOne({
            head_id: head_id.trim().toLowerCase()
        });

        if (existing_user) {
            return res.status(400).json({message: "User already exists"});
        }

        // Create new user

        const new_user = await Head.create({
            head_id: head_id.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password
        });

        res.status(201).json({
            message: "Successfully Created",
            user: new_user.head_id
        });

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}


const fetch_users = async (req, res) => {
    try {
        const users= await Head.find().select();
        return res.status(200).json({users});
        
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}
export {
    registerUser,
    fetch_users
};
