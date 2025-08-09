export interface INotification {
  id: number;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
  read: boolean;
}
