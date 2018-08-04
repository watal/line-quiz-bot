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
    const cnv_pattern = require('./data/conversation/pattern.json');
    const pedigree_quiz_2013 = require('./data/json_data/pedigree_2013.json');
    const pedigree_quiz_2014 = require('./data/json_data/pedigree_2014.json');
    const pedigree_quiz_2015 = require('./data/json_data/pedigree_2015.json');
    const pedigree_quiz_2016 = require('./data/json_data/pedigree_2016.json');
    const pedigree_quiz = [pedigree_quiz_2013, pedigree_quiz_2014, pedigree_quiz_2015, pedigree_quiz_2016]
    const baseball = require('./data/json_data/baseball.json');

    // イベントオブジェクトを順次処理
    req.body.events.forEach((event) => {
        // テキストメッセージに返信
        if (event.type == "message" && event.message.type == "text") {
            // 1対1の会話パターン
            for (let i in cnv_pattern) {
                if (event.message.text == cnv_pattern[i][0]) {
                    bot.replyMessage(event.replyToken, {
                        type: "text",
                        text: cnv_pattern[i][1]
                    });
                }
            }
            if (event.message.text == '血統クイズ') {
                bot.pushMessage(event.source.groupId, {
                    type: "text",
                    text: "血統クイズ！張り切っていきましょー！"
                });
                // 年度を選ぶ乱数
                var quiz_year = Math.floor( Math.random() * 4 );
                var true_year = quiz_year + 2013
                // 要素を選ぶ乱数 □地・の20XX系と獲得賞金0万円は飛ばす
                while(true) {
                    var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                    var name_key = "の" + true_year;
                    var name_string = pedigree_quiz[quiz_year][random][1].name
                    if (name_string.indexOf("□地") && !((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length)) && pedigree_quiz[quiz_year][random][3].money != "0万円" && pedigree_quiz[quiz_year][random][3].money != "-") {
                        break;
                    }
                }
                // 10秒に1回ヒントを提出
                setTimeout(() => {
                    bot.pushMessage(event.source.groupId, {
                        type: "text",
                        text: "母父：" + pedigree_quiz[quiz_year][random][6].b_sire
                    });
                    setTimeout(() => {
                        bot.pushMessage(event.source.groupId, {
                            type: "text",
                            text: "母：" + pedigree_quiz[quiz_year][random][5].mother
                        });
                        setTimeout(() => {
                            bot.pushMessage(event.source.groupId, {
                                type: "text",
                                text: "父：" + pedigree_quiz[quiz_year][random][4].father
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
                                }, 6000);
                            }, 6000);
                        }, 6000);
                    }, 6000);
                }, 1000);
            }
            if (event.message.text == '戦績クイズ') {
                bot.pushMessage(event.source.groupId, {
                    type: "text",
                    text: "戦績クイズ！張り切っていきましょー！出題は近5走だよー！"
                });
                // 年度を選ぶ乱数
                var quiz_year = Math.floor( Math.random() * 4 );
                var true_year = quiz_year + 2013
                // 要素を選ぶ乱数 □地・○地・の20XX系と獲得賞金0万円は飛ばす
                while(true) {
                    var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                    var name_key = "の" + true_year;
                    var name_string = pedigree_quiz[quiz_year][random][1].name
                    if (name_string.indexOf("□地") && name_string.indexOf("○地") &&!((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length)) && pedigree_quiz[quiz_year][random][3].money != "0万円" && pedigree_quiz[quiz_year][random][3].money != "-" && pedigree_quiz[quiz_year][random][7].length >= 6) {
                        break;
                    }
                }

                // 5走前，4走前，3走前，2走前の待ち時間
                let wait_times = [6000, 6000, 6000, 6000]
                if (pedigree_quiz[quiz_year][random][7][24] == null) {wait_times[0] = 3000}
                if (pedigree_quiz[quiz_year][random][7][18] == null) {wait_times[1] = 3000}
                if (pedigree_quiz[quiz_year][random][7][12] == null) {wait_times[2] = 3000}
                if (pedigree_quiz[quiz_year][random][7][6] == null) {wait_times[3] = 3000}

                // 10秒に1回ヒントを提出
                setTimeout(() => {
                    var race_ymd_5 = pedigree_quiz[quiz_year][random][7][24]
                    if (race_ymd_5 != null) {
                        bot.pushMessage(event.source.groupId, {
                            type: "text",
                            text: "5走前：\n　日付：" + race_ymd_5.race_ymd + "\n　開催：" + pedigree_quiz[quiz_year][random][7][25].race_place + "\n　名称：" + pedigree_quiz[quiz_year][random][7][26].race_name + "\n　着順：" + pedigree_quiz[quiz_year][random][7][27].race_result + "着\n　鞍上：" + pedigree_quiz[quiz_year][random][7][28].race_jockey + "\n　条件：" + pedigree_quiz[quiz_year][random][7][29].race_conditions
                        })
                    } else {
                        bot.pushMessage(event.source.groupId, {
                            type: "text",
                            text: "5走前：なし"
                        });
                    }
                    setTimeout(() => {
                        var race_ymd_4 = pedigree_quiz[quiz_year][random][7][18]
                        if (race_ymd_4 != null) {
                            bot.pushMessage(event.source.groupId, {
                                type: "text",
                                text: "4走前：\n　日付：" + race_ymd_4.race_ymd + "\n　開催：" + pedigree_quiz[quiz_year][random][7][19].race_place + "\n　名称：" + pedigree_quiz[quiz_year][random][7][20].race_name + "\n　着順：" + pedigree_quiz[quiz_year][random][7][21].race_result + "着\n　鞍上：" + pedigree_quiz[quiz_year][random][7][22].race_jockey + "\n　条件：" + pedigree_quiz[quiz_year][random][7][23].race_conditions
                            })
                        } else {
                            bot.pushMessage(event.source.groupId, {
                                type: "text",
                                text: "4走前：なし"
                            });
                        }
                        setTimeout(() => {
                            var race_ymd_3 = pedigree_quiz[quiz_year][random][7][12]
                            if (race_ymd_3 != null) {
                                bot.pushMessage(event.source.groupId, {
                                    type: "text",
                                    text: "3走前：\n　日付：" + race_ymd_3.race_ymd + "\n　開催：" + pedigree_quiz[quiz_year][random][7][13].race_place + "\n　名称：" + pedigree_quiz[quiz_year][random][7][14].race_name + "\n　着順：" + pedigree_quiz[quiz_year][random][7][15].race_result + "着\n　鞍上：" + pedigree_quiz[quiz_year][random][7][16].race_jockey + "\n　条件：" + pedigree_quiz[quiz_year][random][7][17].race_conditions
                                })
                            } else {
                                bot.pushMessage(event.source.groupId, {
                                    type: "text",
                                    text: "3走前：なし"
                                });
                            }
                                setTimeout(() => {
                                var race_ymd_2 = pedigree_quiz[quiz_year][random][7][6]
                                if (race_ymd_2 != null) {
                                    bot.pushMessage(event.source.groupId, {
                                        type: "text",
                                        text: "2走前：\n　日付：" + race_ymd_2.race_ymd + "\n　開催：" + pedigree_quiz[quiz_year][random][7][7].race_place + "\n　名称：" + pedigree_quiz[quiz_year][random][7][8].race_name + "\n　着順：" + pedigree_quiz[quiz_year][random][7][9].race_result + "着\n　鞍上：" + pedigree_quiz[quiz_year][random][7][10].race_jockey + "\n　条件：" + pedigree_quiz[quiz_year][random][7][11].race_conditions
                                    })
                                } else {
                                    bot.pushMessage(event.source.groupId, {
                                        type: "text",
                                        text: "2走前：なし"
                                    });
                                }
                                setTimeout(() => {
                                    bot.pushMessage(event.source.groupId, {
                                        type: "text",
                                        text: "前走：\n　日付：" + pedigree_quiz[quiz_year][random][7][0].race_ymd + "\n　開催：" + pedigree_quiz[quiz_year][random][7][1].race_place + "\n　名称：" + pedigree_quiz[quiz_year][random][7][2].race_name + "\n　着順：" + pedigree_quiz[quiz_year][random][7][3].race_result + "着\n　鞍上：" + pedigree_quiz[quiz_year][random][7][4].race_jockey + "\n　条件：" + pedigree_quiz[quiz_year][random][7][5].race_conditions
                                    });
                                    setTimeout(() => {
                                        bot.pushMessage(event.source.groupId, {
                                            type: "text",
                                            text: "正解は" + pedigree_quiz[quiz_year][random][1].name + "でした〜"
                                        });
                                    }, 6000);
                                }, wait_times[3]);
                            }, wait_times[2]);
                        }, wait_times[1]);
                    }, wait_times[0]);
                }, 1000);
            }
            
            if (event.message.text == '選手クイズ') {
                bot.pushMessage(event.source.groupId, {
                    type: "text",
                    text: "選手クイズ！張り切っていきましょー！"
                });
                // 10秒に1回ヒントを提出
                setTimeout(() => {
                    bot.pushMessage(event.source.groupId, {
                        type: "text",
                        text: "投打：" + baseball[random][4].toda
                    });
                    setTimeout(() => {
                        bot.pushMessage(event.source.groupId, {
                        type: "text",
                        text: "身長体重：" + baseball[random][5].heightandweight
                        });
                        setTimeout(() => {
                            bot.pushMessage(event.source.groupId, {
                        	type: "text",
                        	text: "生年月日：" + baseball[random][6].born
                            });
                            setTimeout(() => {
                                bot.pushMessage(event.source.groupId, {
                        		type: "text",
                        		text: "ポジション：" + baseball[random][3].position
                                });
                                setTimeout(() => {
                                	bot.pushMessage(event.source.groupId, {
                        			type: "text",
                        			text: "ドラフト：" + baseball[random][8].draft
                                	});
                                	setTimeout(() => {
                                		bot.pushMessage(event.source.groupId, {
                        				type: "text",
                        				text: "経歴：" + baseball[random][7].career
                                		});
                                		setTimeout(() => {
                                			bot.pushMessage(event.source.groupId, {
                        					type: "text",
                        					text: "所属チーム：" + baseball[random][1].team
                                			});
                                			setTimeout(() => {
                                    			bot.pushMessage(event.source.groupId, {
                                        		type: "text",
                                        		text: "正解は" + pedigree_quiz[quiz_year][random][1].name + "選手でした〜"
                                    			});
                                    		}, 10000);
                                    	}, 6000);
                                	}, 6000);
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
