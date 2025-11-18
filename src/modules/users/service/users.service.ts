import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { connectDB } from '../../../database/connectDB';
import { ObjectId } from 'mongodb';
import * as dotenv from "dotenv";
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

dotenv.config();                      // Load environment variables
const dbCollection = 'user';          // MongoDB collection name

@Injectable()
export class UsersService {
  private readonly collectionName = dbCollection;

  public async getCollection() {
    const db = await connectDB();     // Database connection
    return db.collection(this.collectionName);  // Return the specific collection
  }

//************************** USERS *************************************/
  /*** SERVICE: GET ALL USERS ************/
  async getAll() {                    // Get all users from the collection
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  /*** SERVICE: GET USER BY ID ************/
  async getById(id: string) {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    if (!doc) throw new NotFoundException(`User with id ${id} not found`);
    return doc;
  }

  /*** SERVICE: CREATE NEW USER ************/
  async create(createUserDto: CreateUserDto) {
    const collection = await this.getCollection();

    // Verificar duplicados
    const existingData = await this.findByEmailOrUsername(createUserDto.email, createUserDto.username);
    
    if (existingData) {
      let message = 'Estos datos ya están registrados: ';
      if (existingData.email) message += 'email ';
      if (existingData.username) message += 'usuario';
      throw new BadRequestException(message.trim());
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Preparar datos
    const userData = {
      user: {
        name: createUserDto.name,
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
        tasks: Array.isArray(createUserDto.tasks) ? createUserDto.tasks : [],
      }
    };

    // Insertar en la base de datos
    const result = await collection.insertOne(userData);
    return { message: 'Usuario registrado', user: {  _id: result.insertedId, ...userData } };
  }
  
//************************** REGISTER *************************************/
  /*** SERVICE: CHECK IF USERNAME OR EMAIL USER ALREADY EXISTS ************/
  async findByEmailOrUsername(email: string, username: string) {
    const collection = await this.getCollection();

    // Buscar usuario que tenga el email o el username
    const existingData = await collection.findOne({
      $or: [ { 'user.email': email }, { 'user.username': username } ]
    });

    // Si no existe, retornamos null
    if (!existingData) return null;

    // Retornamos específicamente cuál campo está repetido
    const result: { email?: boolean; username?: boolean } = {};
    if (existingData.user.email === email) result.email = true;
    const decodedUsername = existingData.user.username;
    if (decodedUsername === username ) result.username = true;

    return result;
  }

  
}