import {prisma} from '../config/prisma.js';

// Get user by ID
export async function getUserById(req, res) {
    try{
        const {id} = req.user.id; // Get user ID from middleware assigned req.user
        // Validate ID
        if(!id){
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }
        // Fetch user by ID
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        })

        // Check if user exists
        if(!user){
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        // Respond with user data
        return res.status(200).json({ status: 200, message: "User fetched successfully", data: user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}

// Get all users
export async function getAllUsers(req, res) {
    try{
        const users = await prisma.user.findMany() // Fetch all users
        // Check if users exist
        if(users.length === 0){
            return res.status(404).json({ status: 404, message: "No users found" });
        }

        // Respond with users
        return res.status(200).json({ status: 200, message: "Users fetched successfully", data: users });
    }catch(err){
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}

// Update User by Id

export async function updateUserById(req, res) {
    try{
        const {id} = req.user.id; // Get user ID from request parameters
        const {username, email} = req.body; // Get updated data from request body
        
        // Validate ID
        if(!id){
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }
        // Vaildate username and email
        if(!username && !email){
            return res.status(400).json({ status: 400, message: "At least one field (username or email) is required to update" });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                username: username,
                email: email
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Respond with updated user data
        return res.status(200).json({ status: 200, message: "User updated successfully", data: updatedUser });
    }catch(err){
        console.error("Error updating user:", err);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}
// Forget Password
export async function forgetPassword(req, res){
    try{
        const { id } = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // Validate Id
        if(!id){
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }

        // Validate input
        if(!oldPassword || !newPassword){
            return res.status(400).json({ status: 400, message: "Old password and new password are required" });
        }

        // Find user by ID
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        // Check if user exists
        if(!user){
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // Compare old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

        // If old password is incorrect
        if(!isOldPasswordValid){
            return res.status(400).json({ status: 400, message: "Old password is incorrect" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user's password
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password: hashedNewPassword }
        });

        // Respond with success

        return res.status(200).json({ status: 200, message: "Password updated successfully" });

    }catch(err){
        console.error("Error in forget password:", err); 
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}

// update User Role

export async function updateUserRole(req, res) {
    try{
        const {id} = req.user.id; // Get user ID from request parameters
        const {email,role} = req.body; // Get updated role from request body
        
        // Validate ID
        if(!id){
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }
        // Vaildate role
        if(!role){
            return res.status(400).json({ status: 400, message: "Role is required to update" });
        }

        // Validate role value
        const validRoles = ['USER', 'ADMIN'];
        if(!validRoles.includes(role)){
            return res.status(400).json({ status: 400, message: "Invalid role value" });
        }

        // Validate email
        if(!email){
            return res.status(400).json({ status: 400, message: "Email is required to update role" });
        }
        
        // Update user role
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                role: role
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        // Respond with updated user data
        return res.status(200).json({ status: 200, message: "User role updated successfully", data: updatedUser });
    }catch(err){
        console.error("Error updating user role:", err);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}

// Delete User by ID

export async function deleteUserById(req, res) {
    try{
        const {id} = req.user.id; // Get user ID from request parameters
        
        // Validate ID
        if(!id){
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }

        // Delete user
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        
        // Respond with success
        return res.status(200).json({ status: 200, message: "User deleted successfully" });
    }catch(err){
        console.error("Error deleting user:", err);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}


