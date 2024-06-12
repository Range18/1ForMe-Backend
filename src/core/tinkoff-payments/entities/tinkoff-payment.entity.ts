import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tinkoff_payments')
export class TinkoffPaymentEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column()
  paymentId: string;

  @Column()
  transactionId: number;

  //TODO not null
  @Column({ nullable: true })
  paymentURL?: string;
}
