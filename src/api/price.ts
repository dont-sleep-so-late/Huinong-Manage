import axios from 'axios'
import request from 'axios'

const BASE_URL = 'https://ncpscxx.moa.gov.cn'

// 获取农产品分类树
export function getProductTree() {
  return axios.post(`${BASE_URL}/product/homeWholesaleProduct/selectTree`, null, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  })
}

// 获取市场列表
export function getMarketList() {
  return axios.post(`${BASE_URL}/product/homeWholesalePrice/proAndMarket`, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  })
}

// 获取价格趋势数据
export interface PriceTrendParams {
  startTime: string
  endTime: string
  productId: string
  productClass1Code: string
  productClass2Code: string
  marketName?: string
  province?: string
  timetype?: string
}

export function getPriceTrend(params: PriceTrendParams) {
  return axios.post(`${BASE_URL}/product/homeWholesalePrice/selectWholesalePrice`, null, {
    params,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  })
} 

// 获取最新市场品种数据
export function getNewestMarketData(varietyCode: string) {
    return axios.get(`${BASE_URL}/product/common-price-avg/getNewestMarketVarietyData?varietyCode=${varietyCode}`, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
  }
  
  // 获取农产品分类树
  export function getProductTreeList() {
    return axios.post(`${BASE_URL}/product/common-price-avg/treelist`, null, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
  }

  // 获取新闻列表
  export function getNewsList(params: {
    page: number;
    rows: number;
    type?: string;
    isLatestMessage?: boolean;
    channel?: string;
    source?: string;
    time?: string;
  }) {
    return axios.post('http://zdscxx.moa.gov.cn:8080/nyb/getMessages', 
      {
        ...params,
        type: '最新发布',
        isLatestMessage: true
      },
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    )
  }

  // 获取新闻详情
  export function getNewsDetail(id: string) {
    return axios.post('http://zdscxx.moa.gov.cn:8080/nyb/getMessagesById',
      `id=${id}`,
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    )
  }

  // 获取品种大类
  export function getVarietyMajorCategories() {
    return request.post<any>(
      'https://pfsc.agri.cn/api/priceQuotationController/getVarietyMajorCategories',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      }
    )
  }

  // 根据大类pid获取子类
  export function getVarietyNameByPid(pid: string) {
    return request.post<any>(
      `https://pfsc.agri.cn/api/priceQuotationController/getVarietyNameByPid?pid=${pid}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      }
    )
  }

  // 获取单品种全国行情
  export function getSingleVarietiesCountry(params: { name: string; cycle: string; order?: string }) {
    const { name, cycle, order = 'ASC' } = params
    return request.post<any>(
      `https://pfsc.agri.cn/api/marketQuotationController/getSingleVarietiesCountry?name=${encodeURIComponent(name)}&cycle=${encodeURIComponent(cycle)}&order=${order}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      }
    )
  }