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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const connectDB_1 = require("../../../database/connectDB");
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
const bcrypt = __importStar(require("bcryptjs"));
dotenv.config();
const dbCollection = 'user';
let UsersService = class UsersService {
    constructor() {
        this.collectionName = dbCollection;
    }
    async getCollection() {
        const db = await (0, connectDB_1.connectDB)();
        return db.collection(this.collectionName);
    }
    async getAll() {
        const collection = await this.getCollection();
        return collection.find().toArray();
    }
    async getById(id) {
        const collection = await this.getCollection();
        const doc = await collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!doc)
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        return doc;
    }
    async create(createUserDto) {
        const collection = await this.getCollection();
        const existingData = await this.findByEmailOrUsername(createUserDto.email, createUserDto.username);
        if (existingData) {
            let message = 'Estos datos ya están registrados: ';
            if (existingData.email)
                message += 'email ';
            if (existingData.username)
                message += 'usuario';
            throw new common_1.BadRequestException(message.trim());
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const userData = {
            user: {
                name: createUserDto.name,
                email: createUserDto.email,
                username: createUserDto.username,
                password: hashedPassword,
                tasks: Array.isArray(createUserDto.tasks) ? createUserDto.tasks : [],
            }
        };
        const result = await collection.insertOne(userData);
        return { message: 'Usuario registrado', user: { _id: result.insertedId, ...userData } };
    }
    async findByEmailOrUsername(email, username) {
        const collection = await this.getCollection();
        const existingData = await collection.findOne({
            $or: [{ 'user.email': email }, { 'user.username': username }]
        });
        if (!existingData)
            return null;
        const result = {};
        if (existingData.user.email === email)
            result.email = true;
        const decodedUsername = existingData.user.username;
        if (decodedUsername === username)
            result.username = true;
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map