"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const connectDB_1 = require("../../../database/connectDB");
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const dbCollection = 'user';
let TasksService = class TasksService {
    constructor() {
        this.collectionName = dbCollection;
    }
    async getCollection() {
        const db = await (0, connectDB_1.connectDB)();
        return db.collection(this.collectionName);
    }
    async addTask(userId, task) {
        const collection = await this.getCollection();
        const objectId = new mongodb_1.ObjectId(userId);
        const userDoc = await collection.findOne({ _id: objectId });
        if (!userDoc) {
            throw new common_1.NotFoundException(`User with id ${userId} not found`);
        }
        const taskId = "t" + ((userDoc.user?.tasks?.length ?? 0) + 1);
        const result = await collection.updateOne({ _id: objectId }, { $push: { "user.tasks": { task: { ...task }, id: taskId } } });
        if (result.matchedCount === 0) {
            throw new common_1.NotFoundException(`User with id ${userId} not found`);
        }
        const updatedUser = await collection.findOne({ _id: objectId });
        if (!updatedUser) {
            console.warn(`Task was added, but user with id ${userId} could not be retrieved`);
            return { message: "Task added successfully, but the user could not be returned", };
        }
        return { message: "Task added successfully", user: updatedUser, };
    }
    async completeTask(userId, taskId) {
        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(userId),
            "user.tasks.id": taskId
        }, {
            $set: { "user.tasks.$.task.completed": true }
        });
        return "Task marked as completed successfully";
    }
    async getTasks(userId, page = 1, limit = 5, name) {
        const collection = await this.getCollection();
        const objectId = new mongodb_1.ObjectId(userId);
        const userDoc = await collection.findOne({ _id: objectId });
        if (!userDoc) {
            throw new common_1.NotFoundException(`User with id ${userId} not found`);
        }
        let tasks = userDoc.user?.tasks ?? [];
        if (name) {
            tasks = tasks.filter((t) => t.task.name.toLowerCase().includes(name.toLowerCase()));
        }
        const total = tasks.length;
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)()
], TasksService);
//# sourceMappingURL=tasks.service.js.map