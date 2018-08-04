# line-quiz-bot
LINE用クイズbot

## 出題クイズ
JSONのデータから，クイズを出題します．  
現在，以下の二種類のクイズを実装しています．

### ダムクイズ
[国土交通省の国土数値情報ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/index.html)にあるダムデータを利用し，ダムクイズを出題します．  
xmlファイルを[xmltojson](https://github.com/watal/xmltojson)でjson形式に変更し，`data/json_data/Dam.json`として保存してください．

### 競走馬クイズ
[netkeiba-collector](https://github.com/watal/netkeiba-collector)で取得したデータを`data/json_data/pedigree_201{3..6}.json`として保存してください．  
競走馬クイズでは，血統クイズと戦績クイズが選択できます．

- 血統クイズ
    競走馬の母父・母・父・生年月日がヒントとして出されます．

- 戦績クイズ
    五走前までの競走成績がヒントとして出されます．

### 野球選手クイズ
各野球選手のプロフィールをヒントに，選手クイズを出題します．  
[npb-collector](https://github.com/watal/npb-collector)で取得したデータを`data/json_data/baseball_player.json`として保存してください．

## 自由会話
`data/conversation/pattern.json`を作成し，一問一答形式で会話を定義できます．

## 使用ライブラリ
[line-bot-sdk-nodejs](https://github.com/line/line-bot-sdk-nodejs)  
- Apache License Version 2.0 [（https://github.com/line/line-bot-sdk-nodejs/blob/master/LICENSE）](https://github.com/line/line-bot-sdk-nodejs/blob/master/LICENSE)
