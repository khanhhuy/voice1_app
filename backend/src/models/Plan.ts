import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table({
  timestamps: true,
  tableName: 'plans',
  underscored: true,
})
export default class Plan extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.BIGINT })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
  })
  declare name: string;

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.DECIMAL, allowNull: false })
  declare max_audio_tokens: number;

  @Column({ type: DataType.DECIMAL, allowNull: false })
  declare max_text_tokens: number;

  @Column({ type: DataType.DECIMAL, defaultValue: 0 })
  declare monthly_price: number;

  @Column({ type: DataType.DECIMAL, defaultValue: 0 })
  declare annual_price: number;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}