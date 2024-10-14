import { prisma } from "./prisma.js";
import { faker } from '@faker-js/faker';

async function createTestRecords<T>(count: number, modelName: string, newRecordFn: () => T): Promise<number[]> {
    const availableModels = ["post", "user", "event"]
    if (!availableModels.includes(modelName)) {
        throw new Error(`Invalid model name: ${modelName}. Available models: ${availableModels.join(', ')}`);
    }
    const data = count > 1 ? faker.helpers.multiple(newRecordFn, { count }) : newRecordFn();
    const prismaModel = (prisma as any)[modelName];
    const createMethod = count > 1 ? prismaModel.createManyAndReturn : prismaModel.create;

    return createMethod({ data, select: { id: true } })
        .then((result: Array<{ id: number }> | { id: number }) => 
            Array.isArray(result) ? result.map((obj) => obj.id) : [result.id]);
}

async function addTestEvents(count: number): Promise<number[]> {
    const newRecordFn = () => {
        return {
            name: faker.company.catchPhrase(),
            description: faker.word.words(),
            date: faker.date.future(),
        }
    }
    const modelName = "event";
    return await createTestRecords(count, modelName, newRecordFn);
}

async function addTestUsers(count: number): Promise<number[]> {
    const newRecordFn = () => {
        return {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password({ length: 10 }),
        }
    }
    const modelName = "user";
    return await createTestRecords(count, modelName, newRecordFn);
}

async function addTestPosts(count: number, authorIds: number[]): Promise<number[]> {
    const newRecordFn = () => {
        return {
            title: "Post about " + faker.word.words({ count: 3 }),
            body: faker.lorem.paragraph(),
            authorId: faker.helpers.arrayElement(authorIds),
        }
    }
    const modelName = "post";
    return await createTestRecords(count, modelName, newRecordFn);
}

async function addTestData() {
    await addTestEvents(1000);
    const userIds = await addTestUsers(1000);
    await addTestPosts(10000, userIds);
}

addTestData()
    .then(() => console.log("Test data added successfully"))
    .catch((err) => {
        prisma.$disconnect();
        console.error("Error adding test data:", err);
    })