interface ErrorResponse {
  error_code: string;
}
export type AxiosResponse<T> = import('axios').AxiosResponse<T & ErrorResponse>;
export type MlzResponse<T> = Promise<AxiosResponse<T & ErrorResponse>>;

export interface UploadRes {
  bucket_url: string;
  data: {
    token: string;
    filename: string;
  }[];
}
