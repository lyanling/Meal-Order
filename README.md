# Meal-Order
NTU CSIE 2023 Fall

## 補充：監控系統建立(若非第一次則跳過第一、二步)
### 第一步：下載Prometheus、Grafana
* 使用Brew下載
    ```
    brew install prometheus
    brew install grafana
    ```

### 第二步：調整及新增Configuration File
* ```Grafana```:因爲```Grafana```裡面的```Port```預設為```3000```會衝突，所以調整Config File(路徑可能不太一樣)
    
    ```
    vim /opt/homebrew/etc/grafana/grafana.ini

    ;http_port = 3000 #原本，換成以下的
    http_port = 8080
    ```

* ```MySQL Exporter```：在```backend```資料夾新增```.my.cnf```檔案，內存帳號密碼等資訊(參考Hackmd```.my.cnf```)內容

### 第三步：依序開啟相關服務
1. 先到```backend```資料夾

    ```
    cd backend
    ```

2. 開啟```Prometheus```
    ```
    
    prometheus --config.file=prometheus_config.yml
    ```
    補充：有時重開會遇到port9090被佔用的狀況，先使用以下code去排除

    ```
    lsof -i:9090 #假設9090是被佔用的，找出對應的PID
    kill Pid_num #假設上面找到PID=30103，那這裡Pid_num=30103 
    ```
3. 開啟```MySQL Exporter```
    ```
    mysqld_exporter/mysqld_exporter --config.my-cnf=.my.cnf
    ```

4. 開啟```Grafana```
    ```
    brew services start grafana #第一次開
    brew services restart grafana #重開
    ```

### 第四步：Grafana設定(非第一次可跳過)

1. 打開```http://localhost:8080```

2. 建立**Conections**：左欄點開=>Connections=>搜尋「Prometheus」後點開=>右上角點Add new data source=>進入頁面中在Connection Block輸入```http://localhost:9090```=>滑到最下面Save & Test

3. **Import Dashboard**：左欄點開=>DashBoard=>右邊點New，按下Import=>Upload dashboard JSON File=>選```Dashboard.json```

### 第五步：打開Dashboard
* 點開**Dashboard**：左欄點開=>DashBoard=>點選「Self-Design Dashboard」