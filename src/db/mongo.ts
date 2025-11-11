import { MongoClient, Db, Collection } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "test_db";

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export const getDb = async (): Promise<Db> => {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }

    if (!dbInstance) {
        dbInstance = client.db(DB_NAME);
    }

    return dbInstance;
};

export const getCollection = async <T extends Document = Document>(
    name: string
): Promise<Collection<T>> => {
    const db = await getDb();
    return db.collection<T>(name);
};

export const closeConnection = async (): Promise<void> => {
    if (client) {
        await client.close();
        client = null;
        dbInstance = null;
    }
};
