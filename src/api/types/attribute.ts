export class Attribute {
  name: string;
  type: 'varchar' | 'int' | 'timestamp';
  value?: string;
  default?: string;
}
