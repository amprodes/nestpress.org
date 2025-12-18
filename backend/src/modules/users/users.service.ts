import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const COLLECTION = 'users';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.database.create<User>(COLLECTION, createUserDto);
    this.logger.log(`User created: ${user.email}`);
    return user;
  }

  async findAll(page = 1, limit = 10): Promise<{ data: User[]; total: number }> {
    return this.database.findAll<User>(COLLECTION, { page, limit });
  }

  async findById(id: string): Promise<User | null> {
    return this.database.findById<User>(COLLECTION, id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.database.findByField<User>(COLLECTION, 'email', email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.database.update<User>(COLLECTION, id, updateUserDto);
    this.logger.log(`User updated: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.database.delete(COLLECTION, id);
    this.logger.log(`User deleted: ${id}`);
    return true;
  }

  async count(): Promise<number> {
    const result = await this.database.findAll<User>(COLLECTION, { page: 1, limit: 1 });
    return result.total;
  }
}
