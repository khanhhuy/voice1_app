import { Sequelize } from "sequelize-typescript";
import User from "./models/User";
import Team from "./models/Team";
import AIAgent from "./models/AIAgent";
import Session from "./models/Session";
import Plan from "./models/Plan";
import Subscription from "./models/Subscription";
import Feedback from "./models/Feedback";

const db = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [User, Team, AIAgent, Session, Plan, Subscription, Feedback],
});

async function sync() {
  await db.sync({ alter: true });
}

function getDb() {
  return db
}

function closeDb() {
  db.close()
}

export { sync, getDb, closeDb }