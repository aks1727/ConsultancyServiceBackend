import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'


const adminSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:['ADMIN','SUPER_ADMIN'],
            default:'ADMIN'
        },
        refreshToken:{
            type:String
        }
    },{timestamps:true}
)

adminSchema.pre('save', async function(){
    if(this.isModified('password')){
        this.password = bcrypt.hashSync(this.password, 10)
    }
})

adminSchema.methods.validatePassword = async function(password){
    return bcrypt.compareSync(password, this.password)
}

adminSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

adminSchema.methods.generateAccessToken = function () {
    // syntax
    return jwt.sign(
        {   // this is the payload
            _id: this._id,
            username: this.username,
            role: this.role,
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        }
    )
}
adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {   // this is the payload
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const Admin = mongoose.model('Admin',adminSchema);