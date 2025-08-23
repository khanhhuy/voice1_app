import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, CreatedAt, UpdatedAt, HasMany, Index } from "sequelize-typescript";
import User from "./User";

@Table({
  timestamps: true,
  tableName: 'team',
  underscored: true,
})
export default class Team extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.BIGINT })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare label: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  @Index
  declare name: string;

  @HasMany(() => User, { constraints: false, foreignKey: 'team_id' })
  declare users: User[];

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}