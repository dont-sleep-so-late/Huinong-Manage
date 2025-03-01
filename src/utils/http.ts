import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { message } from "ant-design-vue";
import { useUserStore } from "@/store";

// API响应数据接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // 从环境变量获取API地址
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求队列和取消令牌存储
interface PendingRequest {
  url: string;
  cancel: () => void;
}
const pendingRequests: PendingRequest[] = [];

// 判断是否存在重复请求
const removePendingRequest = (config: AxiosRequestConfig): void => {
  pendingRequests.forEach((item, index) => {
    if (item.url === `${config.url}&${config.method}`) {
      // 取消请求
      item.cancel();
      // 从队列中移除
      pendingRequests.splice(index, 1);
    }
  });
};

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 取消重复请求
    removePendingRequest(config);

    // 创建取消令牌
    const cancelToken = axios.CancelToken;
    config.cancelToken = new cancelToken((cancel) => {
      pendingRequests.push({
        url: `${config.url}&${config.method}`,
        cancel,
      });
    });

    const userStore = useUserStore();
    const token = userStore.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>): Promise<T> => {
    // 从队列中移除已完成的请求
    removePendingRequest(response.config);

    const { code, message: msg, data } = response.data;
    // 根据自定义错误码判断请求是否成功
    if (code === 200) {
      // 只返回数据部分
      return Promise.resolve(data);
    }
    // 处理业务错误
    message.error(msg || "操作失败");
    return Promise.reject(new Error(msg || "操作失败"));
  },
  (error) => {
    // 从队列中移除已完成的请求
    if (error.config) {
      removePendingRequest(error.config);
    }

    // 如果是请求取消，不显示错误信息
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const { response } = error;
    if (response && response.data) {
      const { code, message: msg } = response.data;
      message.error(msg || "操作失败");
      // 处理401错误
      if (code === 401) {
        const userStore = useUserStore();
        userStore.logout();
      }
    } else {
      message.error("网络错误，请稍后重试");
    }
    return Promise.reject(error);
  }
);

// 请求重试机制
const retryRequest = async <T>(
  url: string,
  config: AxiosRequestConfig = {},
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await http.get(url, config);
  } catch (err) {
    if (retries <= 0) {
      return Promise.reject(err);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(url, config, retries - 1, delay);
  }
};

// 封装常用的请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return http.get(url, config);
  },

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return http.post(url, data, config);
  },

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return http.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return http.delete(url, config);
  },

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return http.patch(url, data, config);
  },

  // 带重试机制的请求
  retry<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    return retryRequest<T>(url, config, retries, delay);
  },

  // 取消所有正在进行的请求
  cancelAllRequests() {
    pendingRequests.forEach((item) => {
      item.cancel();
    });
    pendingRequests.length = 0;
  },
};

export { http };
