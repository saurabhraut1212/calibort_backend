export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown | null;
};

export const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data
});

export const fail = (message: string, errors?: unknown): ApiResponse<null> => ({
  success: false,
  message,
  errors: errors ?? null
});
