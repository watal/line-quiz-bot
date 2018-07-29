# quiz_bot
LINE用クイズbot

## 出題クイズ
JSONのデータから，クイズを出題します．
現在，以下の二種類のクイズを実装しています．

### ダムクイズ
[国土交通省の国土数値情報ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/index.html)にあるダムデータを利用し，ダムクイズを出題します．

xmlファイルを[xmltojson](https://github.com/watal1/netkeiba_pedigree)でjson形式に変更し，`data/json_data`ディレクトリに入れてください．

### 競走馬クイズ
[netkeiba-collector](https://github.com/watal1/netkeiba_pedigree)で取得したデータを`data/json_data`ディレクトリに入れることで，競走馬クイズが出題されます．

- 血統クイズ
    競走馬の母父・母・父・生年月日がヒントとして出されます．

- 戦績クイズ
    五走前までの競走成績がヒントとして出されます．

## 自由会話
`data/conversation/pattern.json`を作成し，一問一答形式で会話を定義できます．
