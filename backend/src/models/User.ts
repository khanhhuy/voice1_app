import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, Index, UpdatedAt, CreatedAt, BelongsTo, HasMany } from "sequelize-typescript";
import Team from "./Team";
import Session from "./Session";
import Feedback from "./Feedback";

@Table({
  timestamps: true,
  tableName: 'users',
  underscored: true,
  indexes: [
    {
      name: 'team_id_email_idx',
      unique: true,
      fields: ['team_id', 'email'],
    }
  ]
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.BIGINT })
  declare id: string;

  @Column({ type: DataType.BIGINT })
  declare team_id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  @Index
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare display_name: string;

  @Column({ type: DataType.STRING(255) })
  declare sso_provider: string;

  @Column({ type: DataType.STRING(255) })
  declare password_hash: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare settings: object;

  @Column({ type: DataType.DATE })
  declare last_login_at: Date;

  @BelongsTo(() => Team, { constraints: false, foreignKey: 'team_id' })
  declare team: Team;

  @HasMany(() => Session, { constraints: false, foreignKey: 'user_id' })
  declare sessions: Session[];

  @HasMany(() => Feedback, { constraints: false, foreignKey: 'user_id' })
  declare feedbacks: Feedback[];

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}