# API 說明書

## 登入相關 `/login`

### `GET /login/sso`

| 功能 |
| - |
| 取得 SSO 位置。 |

| 要求 |
| - |
| 無。 |

| 回應 |
| - |
| JSON 物件 |
| 有 `action` 以及 `target` 兩個鍵值。 |
| `action` 只有一個可能值 `redirect`。 |
| `target` 是一個網址，SSO 登入畫面的位置。 |

### `POST /login/sso`

| 功能 |
| - |
| 從 SSO 獲得驗證碼後，登入此系統。 |

| 要求 |
| - |
| 餅乾中應該帶有 SSO 所附上的驗證碼。 |
| 該驗證碼的鍵值為 `sso-token`。 |

| 回應 |
| - |
| JSON 物件 |
| 有 `success`、`token` 以及 `message` 三個鍵值。 |
| `success` 是布林值，表示是否驗證成功。 |
| `token` 是一個字串，表示登入代幣。 |
| `message` 是一個字串，錯誤訊息。 |
| 當 `success` 為 `true` 時， 只有 `token`；當 `success` 為 `false` 時，只有 `message`。 |

 ### `POST /login/standalone`
 
| 功能 |
| - |
| 用帳號、密碼登入系統（僅限校外人士）。|

| 要求 |
| - |
| JSON 物件 |
| 包含 `email` 以及 `password` 兩個鍵值。 |

| 回應 |
| - |
| `success` 是布林值，表示是否驗證成功。 |
| `token` 是一個字串，表示登入代幣。 |
| `message` 是一個字串，錯誤訊息。 |
| 當 `success` 為 `true` 時， 只有 `token`；當 `success` 為 `false` 時，只有 `message`。 |

## 最新消息相關 `/news`

### `GET /news`

| 功能 |
| - |
| 取得所有最新消息。 |

| 要求 |
| - |
| 無。 |

| 回應 |
| - |
| 最新消息物件陣列。每個元素包含 `id`, `date`, `summary`, `source`, `link`。 |

### `GET /news?page=[page]`

| 功能 |
| - |
| 取得分頁消息。 |

| 要求 |
| - |
| `page` - 分頁，正整數。 |

| 回應 |
| - |
| 小於等於 10 則的最新消息物件陣列。每個元素包含 `id`, `date`, `summary`, `source`, `link`。 |

### `GET /news/[id]`

| 功能 |
| - |
| 取得一則消息。 |

| 要求 |
| - |
| `id` - 特定消息的 `id`。 |

| 回應 |
| - |
| 最新消息物件，包含 `id`, `date`, `summary`, `source`, `link`。 |

### `POST /news`

| 功能 |
| - |
| 建立一則新的最新消息。 |

| 要求 |
| - |
| 無。 |

| 回應 |
| - |
| 最新消息的 `id`。 |

### `PUT /news/[id]`

| 功能 |
| - |
| 更新一則消息。 |

| 要求 |
| - |
| `id` - 消息的 `id`。 |
| 主體為一則消息。 |

| 回應 |
| - |
| Status Code 204 |

### `DELETE /news/[id]`

| 功能 |
| - |
| 刪除一則消息。 |

| 要求 |
| - |
| `id` - 消息的 `id`。 |

| 回應 |
| - |
| Status Code 200 |

---

<pre>
API v2
Hsu Peng Jun
</pre>

<template>
| 功能 |
| - |
|  |

| 要求 |
| - |
|  |

| 回應 |
| - |
|  |
</template>
