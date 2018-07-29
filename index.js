// モジュールのインポート
const server = require('express')();    // Express
const line = require('@line/bot-sdk');  // Messaging APIのSDK

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
    // 会話パターンのように自由に追加できるようにしたい．
    const cnv_pattern = require('./data/conversation/pattern.json');
    const pedigree_quiz_2013 = require('./data/json_data/pedigree_2013.json');
    const pedigree_quiz_2014 = require('./data/json_data/pedigree_2014.json');
    const pedigree_quiz_2015 = require('./data/json_data/pedigree_2015.json');
    const pedigree_quiz_2016 = require('./data/json_data/pedigree_2016.json');
    const pedigree_quiz = [pedigree_quiz_2013, pedigree_quiz_2014, pedigree_quiz_2015, pedigree_quiz_2016]
    const Dam_data = require('./data/json_data/Dam.json');

    // イベントオブジェクトを順次処理
    req.body.events.forEach((event) => {
        // テキストメッセージに返信
        if (event.type == 'message' && event.message.type == 'text') {
            // 1対1の会話パターン
            for (let i in cnv_pattern) {
                if (event.message.text == cnv_pattern[i][0]) {
                    bot.replyMessage(event.replyToken, {
                        type: 'text',
                        text: cnv_pattern[i][1]
                    });
                }
            }
            if (event.message.text == '血統クイズ') {
                bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '血統クイズ！張り切っていきましょー！'
                });
                // 年度を選ぶ乱数
                let quiz_year = Math.floor( Math.random() * 4 );
                let true_year = quiz_year + 2013
                // 要素を選ぶ乱数 □地・の20XX系と獲得賞金0万円は飛ばす
                while(true) {
                    var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                    var target_year = pedigree_quiz[quiz_year][random]
                    let name_key = 'の' + true_year;
                    let name_string = target_year[1].name
                    if (name_string.indexOf('□地') && !((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length)) && target_year[3].money != '0万円' && target_year[3].money != '-') {
                        break;
                    }
                }
                // 10秒に1回ヒントを提出
                setTimeout(() => {
                    bot.pushMessage(event.source.groupId, {
                        type: 'text',
                        text: '母父：' + target_year[6].b_sire
                    });
                    setTimeout(() => {
                        bot.pushMessage(event.source.groupId, {
                            type: 'text',
                            text: '母：' + target_year[5].mother
                        });
                        setTimeout(() => {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '父：' + target_year[4].father
                            });
                            setTimeout(() => {
                                bot.pushMessage(event.source.groupId, {
                                    type: 'text',
                                    text: '生年月日：' + target_year[2].birthday
                                });
                                setTimeout(() => {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '正解は' + target_year[1].name + 'でした〜'
                                    });
                                }, 10000);
                            }, 6000);
                        }, 6000);
                    }, 6000);
                }, 1000);
            }
            if (event.message.text == '戦績クイズ') {
                bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '戦績クイズ！張り切っていきましょー！出題は近5走だよー！'
                });
                // 年度を選ぶ乱数
                let quiz_year = Math.floor( Math.random() * 4 );
                let true_year = quiz_year + 2013
                // 要素を選ぶ乱数 □地・○地・の20XX系と獲得賞金0万円は飛ばす
                while(true) {
                    var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                    var target_year = pedigree_quiz[quiz_year][random]
                    let name_key = 'の' + true_year;
                    let name_string = target_year[1].name
                    if (name_string.indexOf('□地') && name_string.indexOf('○地') &&!((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length)) && target_year[3].money != '0万円' && target_year[3].money != '-' && target_year[7].length >= 6) {
                        break;
                    }
                }

                // 5走前，4走前，3走前，2走前の待ち時間
                let wait_times = [6000, 6000, 6000, 6000]
                if (target_year[7][24] == null) {wait_times[0] = 3000}
                if (target_year[7][18] == null) {wait_times[1] = 3000}
                if (target_year[7][12] == null) {wait_times[2] = 3000}
                if (target_year[7][6] == null) {wait_times[3] = 3000}

                // 10秒に1回ヒントを提出
                setTimeout(() => {
                    if (target_year[7][24] != null) {
                        bot.pushMessage(event.source.groupId, {
                            type: 'text',
                            text: '5走前：\n　日付：' + target_year[7][24].race_ymd + '\n　開催：' + target_year[7][25].race_place + '\n　名称：' + target_year[7][26].race_name + '\n　着順：' + target_year[7][27].race_result + '着\n　鞍上：' + target_year[7][28].race_jockey + '\n　条件：' + target_year[7][29].race_conditions
                        })
                    } else {
                        bot.pushMessage(event.source.groupId, {
                            type: 'text',
                            text: '5走前：なし'
                        });
                    }
                    setTimeout(() => {
                        if (target_year[7][18] != null) {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '4走前：\n　日付：' + target_year[7][18].race_ymd + '\n　開催：' + target_year[7][19].race_place + '\n　名称：' + target_year[7][20].race_name + '\n　着順：' + target_year[7][21].race_result + '着\n　鞍上：' + target_year[7][22].race_jockey + '\n　条件：' + target_year[7][23].race_conditions
                            })
                        } else {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '4走前：なし'
                            });
                        }
                        setTimeout(() => {
                            if (target_year[7][12] != null) {
                                bot.pushMessage(event.source.groupId, {
                                    type: 'text',
                                    text: '3走前：\n　日付：' + target_year[7][12].race_ymd + '\n　開催：' + target_year[7][13].race_place + '\n　名称：' + target_year[7][14].race_name + '\n　着順：' + target_year[7][15].race_result + '着\n　鞍上：' + target_year[7][16].race_jockey + '\n　条件：' + target_year[7][17].race_conditions
                                })
                            } else {
                                bot.pushMessage(event.source.groupId, {
                                    type: 'text',
                                    text: '3走前：なし'
                                });
                            }
                                setTimeout(() => {
                                if (target_year[7][6] != null) {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '2走前：\n　日付：' + target_year[7][6].race_ymd + '\n　開催：' + target_year[7][7].race_place + '\n　名称：' + target_year[7][8].race_name + '\n　着順：' + target_year[7][9].race_result + '着\n　鞍上：' + target_year[7][10].race_jockey + '\n　条件：' + target_year[7][11].race_conditions
                                    })
                                } else {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '2走前：なし'
                                    });
                                }
                                setTimeout(() => {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '前走：\n　日付：' + target_year[7][0].race_ymd + '\n　開催：' + target_year[7][1].race_place + '\n　名称：' + target_year[7][2].race_name + '\n　着順：' + target_year[7][3].race_result + '着\n　鞍上：' + target_year[7][4].race_jockey + '\n　条件：' + target_year[7][5].race_conditions
                                    });
                                    setTimeout(() => {
                                        bot.pushMessage(event.source.groupId, {
                                            type: 'text',
                                            text: '正解は' + target_year[1].name + 'でした〜'
                                        });
                                    }, 10000);
                                }, wait_times[3]);
                            }, wait_times[2]);
                        }, wait_times[1]);
                    }, wait_times[0]);
                }, 1000);
            }

            if (event.message.text == 'ダムクイズ') {
                bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: 'ダムクイズ！張り切っていきましょー！'
                });

                dam_purpose = ['洪水調整，農地防災', '不特定用水，河川維持用水', '灌漑，特定（新規）灌漑用水', '上水道用水', '工業用水道用水', '発電', '消流雪用水', 'レクリエーション']
                dam_type = ['アーチダム', 'バットレスダム', 'アースダム', 'アスファルトフェイシングダム', 'アスファルトコアダム', 'フローティングゲートダム', '重力式コンクリートダム', '重力式アーチダム', '重力式コンクリートダム・フィルダム複合ダム', '中空重力式コンクリートダム', 'マルティプルアーチダム', 'ロックフィルダム', '台形CSGダム']

                // ダムを選ぶ乱数
                while (true) {
                    var random = Math.floor( Math.random() * Dam_data['ksj:Dataset']['ksj:Dam'].length);
                    var target_dam = Dam_data['ksj:Dataset']['ksj:Dam'][random]
                    break;
                }

                let purposes = target_dam['ksj:purpose']
                if (typeof purposes === 'object') {
                    target_purpose = dam_purpose[target_dam['ksj:purpose'][0] - 1]
                    for (let i=1 ; i < purposes.length ; i++) {
                        target_purpose = target_purpose + '・' + dam_purpose[target_dam['ksj:purpose'][i] - 1]
                    }
                } else {
                    target_purpose = dam_purpose[target_dam['ksj:purpose'] - 1]
                }

                let target_address = target_dam['ksj:address']
                let prefecture = target_address.match(/.{2,3}?[都道府県]/);

                // ヒントを提出
                setTimeout(() => {
                    bot.pushMessage(event.source.groupId, {
                        type: 'text',
                        text: '目的：' + target_purpose
                    });
                    setTimeout(() => {
                        bot.pushMessage(event.source.groupId, {
                            type: 'text',
                            text: '総貯水量：' + target_dam['ksj:totalPondage'] + '千㎥'
                        });
                        setTimeout(() => {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '型式：' + dam_type[target_dam['ksj:type'] - 1]
                            });
                            setTimeout(() => {
                                bot.pushMessage(event.source.groupId, {
                                    type: 'text',
                                    text: '水系：' + target_dam['ksj:waterSystemName']
                                });
                                setTimeout(() => {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '所在地：' + prefecture
                                    });
                                    setTimeout(() => {
                                        bot.pushMessage(event.source.groupId, {
                                            type: 'text',
                                            text: '正解は' + target_dam['ksj:damName'] + 'ダムでした〜'
                                        });
                                    }, 10000);
                                }, 6000);
                            }, 6000);
                        }, 6000);
                    }, 6000);
                }, 1000);
            }
        }

        // followかjoinの場合
        else if (event.type == 'follow' || event.type == 'join') {
            bot.pushMessage(event.replyToken, {
                type: 'text',
                text: 'よろしくね！'
            });
        }
    });
});
