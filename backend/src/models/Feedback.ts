import { Table, Column, Model, DataType, BelongsTo, CreatedAt, UpdatedAt, Index } from "sequelize-typescript";
import User from "./User";
import Team from "./Team";

@Table({
  timestamps: true,
  tableName: 'feedbacks',
  underscored: true,
})
export default class Feedback extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  declare id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare user_id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare team_id: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare data: object;

  @BelongsTo(() => User, { constraints: false, foreignKey: 'user_id' })
  declare user: User;

  @BelongsTo(() => Team, { constraints: false, foreignKey: 'team_id' })
  declare team: Team;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}