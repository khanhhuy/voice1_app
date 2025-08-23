import { Table, Column, Model, DataType, BelongsTo, CreatedAt, UpdatedAt, Index } from "sequelize-typescript";
import Team from "./Team";
import Plan from "./Plan";

@Table({
  timestamps: true,
  tableName: 'subscriptions',
  underscored: true,
})
export default class Subscription extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  declare id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare team_id: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  @Index
  declare plan_id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  declare status: 'free' | 'active' | 'cancelled' | 'expired';

  @Column({ type: DataType.DECIMAL, defaultValue: 0, allowNull: false })
  declare total_audio_tokens_used: number;

  @Column({ type: DataType.DECIMAL, defaultValue: 0, allowNull: false })
  declare total_text_tokens_used: number;

  @Column({ type: DataType.DATE })
  declare current_period_start: Date;

  @Column({ type: DataType.DATE })
  declare current_period_end: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare cancel_at_period_end: boolean;

  @BelongsTo(() => Team, { constraints: false, foreignKey: 'team_id' })
  declare team: Team;

  @BelongsTo(() => Plan, { constraints: false, foreignKey: 'plan_id' })
  declare plan: Plan;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}