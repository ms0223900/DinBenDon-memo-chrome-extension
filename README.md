## 簡單的訂便當記帳 Chrome 插件

### 主要特色

- 搜尋購買者（模糊搜尋）
- 已繳錢者之勾選核銷紀錄（使用 local storage，資料存於本地端）
- 紀錄「還沒找零錢給他」的購買者，並以灰底標註出來

### 功能簡介

插件本身只有兩個按鈕，功能就寫在上面，因此我想不必多加解釋；
然而如有 bug，歡迎在此 repo 上提出 issue，非常謝謝您的回饋。

- 重新整理: 如有新訂單時，可按此按鍵重新整理，或手動重新整理，便當訂單的資料才會更新到最新。
- 加載插件: 每次重新開啟頁面時，需手動按此按鍵，進行插件的加載（因網頁的渲染速度不一，故手動更新較優）。

### 如何安裝？

- 下載壓縮檔案
  https://github.com/ms0223900/DinBenDon-memo-chrome-extension/archive/refs/heads/main.zip
- 解壓縮
- 開啟 Chrome 擴充功能頁面
  在網址那邊直接輸入 `chrome://extensions/`，前往該網址
  ![extension in url](https://imgur.com/IQF3uvS.jpg)
- 開啟「開發人員模式」
  ![dev mode](https://imgur.com/NObsdon.jpg)
- 點擊「載入未封裝項目」
  ![load unpacked](https://imgur.com/htMcmWQ.jpg)
- 選擇剛剛解壓縮好的「整包」資料夾
  ![choose unzipped folder](https://imgur.com/tAQEiTL.jpg)
- 點擊右上角的「拼圖」，點擊釘選插件，這時插件就會被釘在右上角的插件列表中
  ![pin the extension](https://imgur.com/A1vT0qR.jpg)
- 點擊寫著「D」的插件，將其畫面開啟，就可使用了
  ![open it](https://imgur.com/dbPan48.jpg)

備註：Edge 的做法可如法炮製

### 如何使用?

每次重新整理或進入「訂單總覽」頁面之後，需手動點擊「載入插件」

- 進入任一個「訂單總覽」的頁面
  ![open page](https://imgur.com/kdv8m5T.jpg)
- 開啟插件，直接點擊「載入插件」即可
  ![click plugin](https://imgur.com/5CtsWF5.jpg)
- 成功加載的範例畫面
  ![plugin loaded successed](https://imgur.com/jLH52pA.jpg)

### 想要更改過濾規則？

目前預設是只有顯示包含「市場」字樣的訂餐者
（排除掉不含市場字樣的訂餐者）

- 如要更改過濾「訂餐者」的規則，可在 content-script.js 的 regex 中的/市場/，改為你想要過濾的字眼(支持正規表達式)
