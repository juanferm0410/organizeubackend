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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/service/users.service");
const tasks_service_1 = require("../../tasks/service/tasks.service");
const dotenv = __importStar(require("dotenv"));
const mongodb_1 = require("mongodb");
const create_task_dto_1 = require("../dto/create-task.dto");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt/jwt-auth.guard");
dotenv.config();
const db = 'users';
let TasksController = class TasksController {
    constructor(tasksService, usersService) {
        this.tasksService = tasksService;
        this.usersService = usersService;
    }
    async addTaskToUser(id, taskDto) {
        this.ensureValidObjectId(id);
        if (!taskDto.name || !taskDto.time || !taskDto.date) {
            throw new common_1.BadRequestException('The task must have a name, date and time');
        }
        const updatedUser = await this.tasksService.addTask(id, taskDto);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`No user with id found ${id}`);
        }
        console.log(`New task added to user ${id}:`, JSON.stringify(taskDto, null, 2));
        return updatedUser;
    }
    async getAllTasks(userId, page, limit, name) {
        this.ensureValidObjectId(userId);
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const result = await this.tasksService.getTasks(userId, pageNum, limitNum, name);
        if (!result.data || result.data.length === 0) {
            throw new common_1.NotFoundException(`No tasks found for user ${userId} with the given filter`);
        }
        return result;
    }
    async getTaskById(userId, taskId) {
        this.ensureValidObjectId(userId);
        const user = await this.usersService.getById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`No user with id found ${userId}`);
        }
        const task = user.user.tasks.find((t) => t.id === taskId);
        if (!task) {
            throw new common_1.NotFoundException(`No task with id found ${taskId} for user ${userId}`);
        }
        return task;
    }
    ensureValidObjectId(id) {
        if (!mongodb_1.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(`The provided id is not a valid ObjectId: ${id}`);
        }
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/tasks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addTaskToUser", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':userId/tasks'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getAllTasks", null);
__decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':userId/tasks/:taskId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTaskById", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)(db),
    __metadata("design:paramtypes", [tasks_service_1.TasksService, users_service_1.UsersService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map