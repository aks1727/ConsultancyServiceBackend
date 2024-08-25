import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



const userSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
        },
        username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
        },
        avatar:{
            type:String,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        phoneNumber:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
        },
        bio:{
            type:String,
        },
        skills:[
            {
                type:String,
            }
        ],
        gender:{
            type:String,
            enum: ['male', 'female', 'other'],
        },
        educations:[
            {
                collegeName:{
                    type:String,
                },
                degree:{
                    type:String,
                },
                from:{
                    type:Date,
                },
                to:{
                    type:Date,
                },
                cgpa:{
                    type:String,
                },
            }
        ],
        experiences:[
            {
                title:{
                    type:String,
                },
                duration:{
                    type:String,
                },
                company:{
                    type:String,
                },
                location:{
                    type:String,
                },
                description:{
                    type:String,
                },
                isWorking:{
                    type:Boolean,
                    default:false,
                }
            }
        ],
        achievements:[
            {
                organization:{
                    type:String,
                },
                achievementTitle:{
                    type:String,
                },
                date:{
                    type:Date,
        
                },
                url:{
                    type:String,
                }
            }
        ],
        
        refreshToken:{
            type:String,
        },

        isMentor:{
            type:String,
            enum:['yes', 'no','pending'],
        },
        followerCount: {
            type: Number,
            default: 0
        },
        followingCount: {
            type: Number,
            default: 0
        }
    },{timestamps:true}
)

userSchema.pre('save', async function(){
    if(this.isModified('password')){
        this.password = bcrypt.hashSync(this.password, 10)
    }
})

userSchema.methods.validatePassword = async function(password){
    return bcrypt.compareSync(password, this.password)
}

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    // syntax
    return jwt.sign(
        {   // this is the payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
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



export const User = mongoose.model("User",userSchema)