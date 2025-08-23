import { Table, Column, Model, DataType, BelongsTo, CreatedAt, UpdatedAt, Index } from "sequelize-typescript";
import User from "./User";
import Team from "./Team";

@Table({
  timestamps: true,
  tableName: 'ai_agents',
  underscored: true,
})
export default class AIAgent extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  declare id: string;

  @Column({ type: DataType.BIGINT })
  @Index
  declare creator_id: string;

  @Column({ type: DataType.BIGINT })
  @Index
  declare team_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare persona_prompt: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare system_prompt: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  declare is_built_in: boolean;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare settings: object;

  @Column({ type: DataType.DATE })
  declare deleted_at: Date;

  @BelongsTo(() => User, { constraints: false, foreignKey: 'user_id' })
  declare user: User;

  @BelongsTo(() => Team, { constraints: false, foreignKey: 'team_id' })
  declare team: Team;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}