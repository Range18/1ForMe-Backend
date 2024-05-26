import type { ItemFFD105Dto } from './item-ffd105.dto';

export type Taxation =
  | 'osn'
  | 'usn_income'
  | 'usn_income_outcome'
  | 'envd'
  | 'esn'
  | 'patent';

export class ReceiptFFD105Dto {
  Items?: ItemFFD105Dto[];

  Phone?: string;

  Taxation!: Taxation;

  constructor(items?: ItemFFD105Dto[], phone?: string, taxation?: Taxation) {
    this.Items = items;
    this.Phone = phone;
    this.Taxation = taxation;
  }
}
