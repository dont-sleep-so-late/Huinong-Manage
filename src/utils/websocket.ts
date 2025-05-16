import { message } from 'ant-design-vue'

interface WebSocketMessage {
  type: string
  content: any
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectInterval = 3000
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map()
  private heartbeatTimer: number | null = null
  private readonly heartbeatInterval = 30000 // 30秒发送一次心跳

  // 检查是否已连接
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  // 从JWT token中解析用户ID
  private parseUserIdFromToken(token: string): string {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      const payload = JSON.parse(jsonPayload)
      return payload.sub || payload.userId
    } catch (error) {
      console.error('解析token失败:', error)
      return ''
    }
  }

  // 连接WebSocket
  connect(token: string) {
    // 如果已经连接，则不需要重新连接
    if (this.isConnected()) {
      console.log('WebSocket已经连接')
      return
    }

    // 如果存在旧连接，先关闭
    if (this.ws) {
      this.close()
    }

    // 从token中解析用户ID
    const userId = this.parseUserIdFromToken(token)
    if (!userId) {
      console.error('无法从token中解析用户ID')
      message.error('WebSocket连接失败：无效的token')
      return
    }

    // 修改为正确的WebSocket URL格式
    const wsUrl = `ws://localhost:8888/api/ws/${userId}?token=${token}`
    console.log('正在连接WebSocket:', wsUrl)
    
    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket连接成功')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'pong') {
            return // 忽略心跳响应
          }
          this.handleMessage(message)
        } catch (error) {
          console.error('解析消息失败:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket连接关闭:', event.code, event.reason)
        this.stopHeartbeat()
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        if (error instanceof Event) {
          console.error('错误类型:', error.type)
          console.error('错误目标:', error.target)
        }
        message.error('消息服务连接异常')
      }
    } catch (error) {
      console.error('WebSocket连接错误:', error)
      this.reconnect()
    }
  }

  // 重连机制
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        const token = localStorage.getItem('token')
        if (token) {
          this.connect(token)
        }
      }, this.reconnectInterval)
    } else {
      message.error('消息服务连接失败，请刷新页面重试')
    }
  }

  // 注册消息处理器
  on(type: string, handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.set(type, handler)
  }

  // 处理接收到的消息
  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message)
    }
  }

  // 发送消息
  send(type: string, content: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type,
        content
      }))
    } else {
      console.error('WebSocket未连接，无法发送消息')
    }
  }

  // 开始心跳
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      this.send('ping', { timestamp: Date.now() })
    }, this.heartbeatInterval)
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 关闭连接
  close() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsClient = new WebSocketClient() 