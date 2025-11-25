export interface INotification {
  id: number;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  timestamp: Date;
  read: boolean;
}
