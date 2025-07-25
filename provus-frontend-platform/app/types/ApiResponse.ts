export type TApiResponse = {
  data?: { [key: string]: unknown } | { [key: string]: unknown }[];
  error?: boolean;
  message?: string;
};
