import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt"

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    verificationToken: string;
    verificationTokenExpiry: Date;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: [true, 'Email already exists'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: [true, 'Username already exists'],
            minLength: [3, 'Username must be at least 3 characters'],
            match: [
                /^[a-zA-Z0-9]+$/,
                'Username must contain only letters and numbers'
            ]
        },
        name: {
            type: String,
            required: [true, 'Name is required']
        },
        avatar: {
            type: String
        }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    console.log('=== USER SCHEMA PRE-SAVE HOOK CALLED ===');
    console.log('isNew:', this.isNew);
    
    if (this.isNew) {
      const user = this;
      console.log('Starting password hashing...');
      const SALT = await bcrypt.genSalt(9);
      console.log('Salt generated');
      const hashedPassword = await bcrypt.hash(user.password as string, SALT);
      console.log('Password hashed successfully');
      user.password = hashedPassword;
      user.avatar = `https://robohash.org/${user.username}`;
      console.log('Pre-save hook completed');
    }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;