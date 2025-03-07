import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    tgId:{
        type:String,
        required:true,
        unique:true
    },

    firstName:{
        type:String,
        required:true

    },

    lastName:{
        type:String,
        required:true},

        isBot:{
            type:Boolean,
            default:false
        },

        username: {
            type: String,
            required: true,
            unique: true
        },
        promptToken:{
            type:Number,
            required:false

        },

        completionToken:{
            type:Number,
            required:false
        }
},{
    timestamps: true
})

export default mongoose.model('User',userSchema)