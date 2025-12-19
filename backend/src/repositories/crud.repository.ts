import { Model, Document, Types } from "mongoose";

export interface ICrudRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  getAll(): Promise<T[]>;
  getById(id: string | Types.ObjectId): Promise<T | null>;
  update(
    id: string | Types.ObjectId,
    data: Partial<T>
  ): Promise<T | null>;
  delete(id: string | Types.ObjectId): Promise<T | null>;
  deleteMany(ids: (string | Types.ObjectId)[]): Promise<{ deletedCount?: number }>;
}

export abstract class BaseRepository<T extends Document> implements ICrudRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async getAll(): Promise<T[]> {
    return await this.model.find();
  }

  async getById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id);
  }

  async update(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true
    });
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteMany(ids: (string | Types.ObjectId)[]): Promise<{ deletedCount?: number }> {
    return await this.model.deleteMany({
      _id: { $in: ids }
    });
  }
}

export default function crudRepository<T extends Document>(
  model: Model<T>
): ICrudRepository<T> {
  return {
    async create(data: Partial<T>): Promise<T> {
      const document = new model(data);
      return await document.save();
    },

    async getAll(): Promise<T[]> {
      return await model.find();
    },

    async getById(id: string | Types.ObjectId): Promise<T | null> {
      return await model.findById(id);
    },

    async update(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null> {
      return await model.findByIdAndUpdate(id, data, {
        new: true
      });
    },

    async delete(id: string | Types.ObjectId): Promise<T | null> {
      return await model.findByIdAndDelete(id);
    },

    async deleteMany(ids: (string | Types.ObjectId)[]): Promise<{ deletedCount?: number }> {
      return await model.deleteMany({
        _id: { $in: ids }
      });
    }
  };
}
