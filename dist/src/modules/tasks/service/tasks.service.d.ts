import { CreateTaskDto } from '../dto/create-task.dto';
export declare class TasksService {
    private readonly collectionName;
    private getCollection;
    addTask(userId: string, task: CreateTaskDto): Promise<{
        message: string;
        user?: undefined;
    } | {
        message: string;
        user: import("mongodb").WithId<import("bson").Document>;
    }>;
    getTasks(userId: string, page?: number, limit?: number, name?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            last_page: number;
        };
    }>;
}
