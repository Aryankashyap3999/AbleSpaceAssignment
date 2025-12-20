import { Document, Types } from "mongoose";
import User, { IUser } from "../models/user.model";
import { BaseRepository, ICrudRepository } from "./crud.repository";

export interface IUserRepository extends ICrudRepository<IUser> {
  signUpUser(data: Omit<IUser, keyof Document>): Promise<IUser>;
  getByEmail(email: string): Promise<IUser | null>;
  getByUsername(username: string): Promise<IUser | null>;
  searchUsers(query: string): Promise<IUser[]>;
  findUserById(userId: Types.ObjectId): Promise<IUser | null>;
  updateUserProfile(userId: Types.ObjectId, updates: Partial<IUser>): Promise<IUser | null>;
}

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async signUpUser(data: Omit<IUser, keyof Document>): Promise<IUser> {
    const user = new User(data);
    return await user.save();
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async getByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async searchUsers(query: string): Promise<IUser[]> {
    return await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('_id name email username avatar');
  }

  async findUserById(userId: Types.ObjectId): Promise<IUser | null> {
    return await User.findById(userId).select('_id name email username avatar');
  }

  async updateUserProfile(userId: Types.ObjectId, updates: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updates, { new: true }).select('_id name email username avatar');
  }

}

export default new UserRepository();