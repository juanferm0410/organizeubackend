import { Injectable, NotFoundException } from '@nestjs/common';
import { connectDB } from '../../../database/connectDB';
import { ObjectId } from 'mongodb';
import * as dotenv from "dotenv";
import { CreateTaskDto } from '../dto/create-task.dto';

dotenv.config();                      // Load environment variables
const dbCollection = 'user';          // MongoDB collection name

@Injectable()
export class TasksService {
  private readonly collectionName = dbCollection;

  private async getCollection() {
    const db = await connectDB();     // Database connection
    return db.collection(this.collectionName);  // Return the specific collection
  }

//************************** TASKS *************************************/
  /*** SERVICE: ADD A TASK TO AN USER ************/
  async addTask(userId: string, task: CreateTaskDto) {
    const collection = await this.getCollection();
    const objectId = new ObjectId(userId);

    // Task Id
    const userDoc = await collection.findOne({ _id: objectId });    // Obtener el usuario
    if (!userDoc) { throw new NotFoundException(`User with id ${userId} not found`); }
    const taskId = "t" + ((userDoc.user?.tasks?.length ?? 0) + 1);   // Calcular taskId como la longitud actual del arreglo + 1

    const result = await collection.updateOne(
      { _id: objectId },
      { $push: { "user.tasks": { task: { ...task }, id: taskId } } } as any // se fuerza el tipo any porque TS valida paths anidados
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const updatedUser = await collection.findOne({ _id: objectId });

    if (!updatedUser) {
      console.warn(`Task was added, but user with id ${userId} could not be retrieved`);
      return { message: "Task added successfully, but the user could not be returned", };
    }

    return { message: "Task added successfully", user: updatedUser, };    // Response to the API caller
  }

  /*** SERVICE: CHECK A COMPLETED TASK ************/
  async completeTask(userId: string, taskId: string) {
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      {
        _id: new ObjectId(userId),
        "user.tasks.id": taskId // busco la tarea específica
      },
      {
        $set: { "user.tasks.$.task.completed": true } // actualizo el estado a completed
      }
    );
    
    return "Task marked as completed successfully";
  }

  /*** SERVICE: GET TASKS WITH PAGINATION AND FILTER ************/
  async getTasks(userId: string, page: number = 1, limit: number = 5, name?: string) {
    const collection = await this.getCollection();
    const objectId = new ObjectId(userId);

    const userDoc = await collection.findOne({ _id: objectId });
    if (!userDoc) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    let tasks = userDoc.user?.tasks ?? [];

    // Filtrado por nombre de tarea
    if (name) {
      tasks = tasks.filter((t: { task: { name: string; }; }) => t.task.name.toLowerCase().includes(name.toLowerCase()));
    }

    const total = tasks.length;

    // Paginación
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTasks = tasks.slice(start, end);

    return {
      data: paginatedTasks,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }
}