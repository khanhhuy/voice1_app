import { Table, Column, Model, DataType, BelongsTo, CreatedAt, UpdatedAt, Index } from "sequelize-typescript";
import User from "./User";
import Team from "./Team";
import AIAgent from "./AIAgent";
import type { ISession } from "@/core/types/core";

@Table({
  timestamps: true,
  tableName: 'sessions',
  underscored: true,
})
export default class Session extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  declare id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare user_id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare team_id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare agent_id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  declare status: 'created' | 'in_progress' | 'paused' | 'completed' | 'failed';

  @Column({ type: DataType.DATE, allowNull: false })
  declare started_at: Date;

  @Column({ type: DataType.DATE })
  declare ended_at: Date;

  @Column({ type: DataType.DECIMAL, defaultValue: 0, allowNull: false })
  declare duration_minutes: number;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare data: ISession.Data;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare usage: object;

  @BelongsTo(() => User, { constraints: false, foreignKey: 'user_id' })
  declare user: User;

  @BelongsTo(() => Team, { constraints: false, foreignKey: 'team_id' })
  declare team: Team;

  @BelongsTo(() => AIAgent, { constraints: false, foreignKey: 'agent_id' })
  declare agent: AIAgent;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}