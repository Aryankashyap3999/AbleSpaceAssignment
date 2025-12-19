import { Document } from "mongoose";
import User, { IUser } from "../models/user.model";
import { BaseRepository, ICrudRepository } from "./crud.repository";

export interface IUserRepository extends ICrudRepository<IUser> {
  signUpUser(data: Omit<IUser, keyof Document>): Promise<IUser>;
  getByEmail(email: string): Promise<IUser | null>;
  getByUsername(username: string): Promise<IUser | null>;

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

}

export default new UserRepository();