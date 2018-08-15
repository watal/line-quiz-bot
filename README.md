# line-quiz-bot
LINE用クイズbot

## 出題クイズ
JSONのデータから，クイズを出題します．  
現在，以下の3種類のクイズを実装しています．

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
[npb-collector](https://github.com/watal/npb-collector)で取得したデータを`data/json_data/baseball_player.json`として保存してください．  
野球選手クイズでは，選手クイズと成績クイズが選択できます．

- 選手クイズ  
    各野球選手のプロフィールをヒントに，選手クイズを出題します．
- 成績クイズ  
    2014年以降の成績をヒントにクイズを出題します．投手・外野手で出されるヒントが異なります．

## 自由会話
`data/conversation/pattern.json`に，一問一答形式で会話を定義できます．  
書式は以下の通りです．
```
[
    [
        "0",
        "こんにちは",
        "こんにちはー"
    ]
]
```
- 第一要素にはマッチタイプを0から3で指定します．
    - 0：完全一致
    - 1：部分一致
    - 2：前方一致
    - 3：後方一致
- 第二要素にはキーとなる人間側のメッセージを指定します
- 第三要素にはbotからの返答となるメッセージを指定します

## 使用ライブラリ
[line-bot-sdk-nodejs](https://github.com/line/line-bot-sdk-nodejs)  
- Apache License Version 2.0 [（https://github.com/line/line-bot-sdk-nodejs/blob/master/LICENSE）](https://github.com/line/line-bot-sdk-nodejs/blob/master/LICENSE)
