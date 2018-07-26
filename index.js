// モジュールのインポート
const server = require("express")();    // Express
const line = require("@line/bot-sdk");  // Messaging APIのSDK

// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,  // アクセストークン
    channelSecret: process.env.LINE_CHANNEL_SECRET      // Channel Secret
};

// Webサーバ設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// ルーター設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    // LINEにステータスコード200でレスポンス
    res.sendStatus(200);

    // 血統クイズ用のデータ
    // page_id: ページID
    // name: 馬名
    // birthday: 生年月日
    // father: 父
    // mother: 母
    // b_sire: 母父

    // JSON読み込み とりあえずハードコーディング
    var cnv_pattern = require('./data/conversation/pattern.json');
    var pedigree_quiz_2013 = require('./data/json/pedigree_2013.json');
    var pedigree_quiz_2014 = require('./data/json/pedigree_2014.json');
    var pedigree_quiz_2015 = require('./data/json/pedigree_2015.json');
    var pedigree_quiz_2016 = require('./data/json/pedigree_2016.json');
    pedigree_quiz = [pedigree_quiz_2013, pedigree_quiz_2014, pedigree_quiz_2015, pedigree_quiz_2016]

    // イベントオブジェクトを順次処理
    req.body.events.forEach((event) => {
        // テキストメッセージに返信
        if (event.type == "message" && event.message.type == "text"){
            // 1対1の会話パターン
            for (let i in cnv_pattern){
                if (event.message.text == cnv_pattern[i][0]){
                    bot.replyMessage(event.replyToken, {
                        type: "text",
                        text: cnv_pattern[i][1]
                    });
                }
            }
            if (event.message.text == '血統クイズ'){
                bot.pushMessage(event.source.groupId, {
                    type: "text",
                    text: "血統クイズ！張り切っていきましょー！"
                });
                // 年度を選ぶ乱数
                var quiz_year = Math.floor( Math.random() * 4 );
                var true_year = quiz_year + 2013
                // 要素を選ぶ乱数 □地との2013系は飛ばす
                while(true){
                    var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                    var name_key = "の" + true_year;
                    var name_string = pedigree_quiz[quiz_year][random][1].name
                    if (name_string.indexOf("□地") && !((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length))){
                        break;
                    }
                }
                // 10秒に1回ヒントを提出
                setTimeout(() => {
                    bot.pushMessage(event.source.groupId, {
                        type: "text",
                        text: "母父：" + pedigree_quiz[quiz_year][random][5].b_sire
                    });
                    setTimeout(() => {
                        bot.pushMessage(event.source.groupId, {
                            type: "text",
                            text: "母：" + pedigree_quiz[quiz_year][random][4].mother
                        });
                        setTimeout(() => {
                            bot.pushMessage(event.source.groupId, {
                                type: "text",
                                text: "父：" + pedigree_quiz[quiz_year][random][3].father
                            });
                            setTimeout(() => {
                                bot.pushMessage(event.source.groupId, {
                                    type: "text",
                                    text: "生年月日：" + pedigree_quiz[quiz_year][random][2].birthday
                                });
                                setTimeout(() => {
                                    bot.pushMessage(event.source.groupId, {
                                        type: "text",
                                        text: "正解は" + pedigree_quiz[quiz_year][random][1].name + "でした〜"
                                    });
                                }, 10000);
                            }, 10000);
                        }, 10000);
                    }, 10000);
                }, 1000);
            }
        }

        // followかjoinの場合
        else if (event.type == 'follow' || event.type == 'join'){
            bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: 'よろしくね！'
            });
        }
    });
});
