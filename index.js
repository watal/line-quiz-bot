// モジュールのインポート
const line = require('@line/bot-sdk');  // Messaging APIのSDK
const express = require('express')();    // Express

// 環境変数からLINE SDK用のパラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,  // アクセストークン
    channelSecret: process.env.LINE_CHANNEL_SECRET      // Channel Secret
};

// Webサーバ設定
express.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// webhook設定
express.post('/webhook', line.middleware(line_config), (req, res, next) => {
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
    const pedigree_quiz = [pedigree_quiz_2013, pedigree_quiz_2014, pedigree_quiz_2015, pedigree_quiz_2016];
    const baseball = require('./data/json_data/baseball_player.json');
    const Dam_data = require('./data/json_data/Dam.json');

    // イベントを順次処理
    req.body.events.forEach((event) => {
        // イベントタイプごとに処理を決定
        switch (event.type) {
            case 'message':
                let message = event.message;
                switch (message.type) {
                    // テキストメッセージに返信
                    case 'text':
                        // 1対1の会話パターン
                        for (let i in cnv_pattern) {
                            let match_pattern;
                            if (cnv_pattern[i][0] == 0) {
                            // 配列の第0要素が1なら完全一致
                                match_pattern = new RegExp('^' + cnv_pattern[i][1] + '$');
                            // 配列の第0要素が1なら部分一致
                            } else if (cnv_pattern[i][0] == 1) {
                                match_pattern = new RegExp('.*' + cnv_pattern[i][1] + '.*');
                            // 配列の第0要素が2なら前方一致
                            } else if (cnv_pattern[i][0] == 2) {
                                match_pattern = new RegExp('^' + cnv_pattern[i][1] + '.*');
                            // 配列の第0要素が3なら後方一致
                            } else if (cnv_pattern[i][0] == 3) {
                                match_pattern = new RegExp('.*' + cnv_pattern[i][1] + '$');
                            };
                            if (message.text.match(match_pattern)) {
                                bot.replyMessage(event.replyToken, {
                                    type: 'text',
                                    text: cnv_pattern[i][2]
                                });
                            };
                        };
                        // クイズ  take_quiz(message);
                        if (message.text == '血統クイズ') {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '血統クイズ！張り切っていきましょー！'
                            });
                            // 年度を選ぶ乱数
                            let quiz_year = Math.floor( Math.random() * 4 );
                            let true_year = quiz_year + 2013;
                            // 要素を選ぶ乱数 □地・の20XX系と獲得賞金0万円は飛ばす
                            while(true) {
                                var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                                var target_year = pedigree_quiz[quiz_year][random];
                                let name_key = 'の' + true_year;
                                let name_string = target_year[1].name;
                                if (name_string.indexOf('□地') && !((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length)) && target_year[3].money != '0万円' && target_year[3].money != '-') {
                                    break;
                                };
                            };
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
                        };

                        if (message.text == '戦績クイズ') {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '戦績クイズ！張り切っていきましょー！出題は近5走だよー！'
                            });
                            // 年度を選ぶ乱数
                            let quiz_year = Math.floor( Math.random() * 4 );
                            let true_year = quiz_year + 2013;
                            // 要素を選ぶ乱数 □地・○地・の20XX系と獲得賞金0万円は飛ばす
                            while(true) {
                                var random = Math.floor( Math.random() * pedigree_quiz[quiz_year].length );
                                var target_year = pedigree_quiz[quiz_year][random];
                                let name_key = 'の' + true_year;
                                let name_string = target_year[1].name;
                                if (name_string.indexOf('□地') && name_string.indexOf('○地') &&!((name_string.lastIndexOf(name_key) + name_key.length === name_string.length) && (name_key.length<=name_string.length)) && target_year[3].money != '0万円' && target_year[3].money != '-' && target_year[7].length >= 6) {
                                    break;
                                };
                            };

                            // 5走前，4走前，3走前，2走前の待ち時間
                            const wait_times = [6000, 6000, 6000, 6000];
                            if (target_year[7][24] == null) {wait_times[0] = 3000};
                            if (target_year[7][18] == null) {wait_times[1] = 3000};
                            if (target_year[7][12] == null) {wait_times[2] = 3000};
                            if (target_year[7][6] == null) {wait_times[3] = 3000};

                            // 10秒に1回ヒントを提出
                            setTimeout(() => {
                                if (target_year[7][24] != null) {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '5走前：\n　日付：' + target_year[7][24].race_ymd + '\n　開催：' + target_year[7][25].race_place + '\n　名称：' + target_year[7][26].race_name + '\n　着順：' + target_year[7][27].race_result + '着\n　鞍上：' + target_year[7][28].race_jockey + '\n　条件：' + target_year[7][29].race_conditions
                                    });
                                } else {
                                    bot.pushMessage(event.source.groupId, {
                                        type: 'text',
                                        text: '5走前：なし'
                                    });
                                };
                                setTimeout(() => {
                                    if (target_year[7][18] != null) {
                                        bot.pushMessage(event.source.groupId, {
                                            type: 'text',
                                            text: '4走前：\n　日付：' + target_year[7][18].race_ymd + '\n　開催：' + target_year[7][19].race_place + '\n　名称：' + target_year[7][20].race_name + '\n　着順：' + target_year[7][21].race_result + '着\n　鞍上：' + target_year[7][22].race_jockey + '\n　条件：' + target_year[7][23].race_conditions
                                        });
                                    } else {
                                        bot.pushMessage(event.source.groupId, {
                                            type: 'text',
                                            text: '4走前：なし'
                                        });
                                    };
                                    setTimeout(() => {
                                        if (target_year[7][12] != null) {
                                            bot.pushMessage(event.source.groupId, {
                                                type: 'text',
                                                text: '3走前：\n　日付：' + target_year[7][12].race_ymd + '\n　開催：' + target_year[7][13].race_place + '\n　名称：' + target_year[7][14].race_name + '\n　着順：' + target_year[7][15].race_result + '着\n　鞍上：' + target_year[7][16].race_jockey + '\n　条件：' + target_year[7][17].race_conditions
                                            });
                                        } else {
                                            bot.pushMessage(event.source.groupId, {
                                                type: 'text',
                                                text: '3走前：なし'
                                            });
                                        };
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
                                            };
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
                        };

                        if (message.text == 'ダムクイズ') {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: 'ダムクイズ！張り切っていきましょー！'
                            });

                            const dam_purpose = ['洪水調整，農地防災', '不特定用水，河川維持用水', '灌漑，特定（新規）灌漑用水', '上水道用水', '工業用水道用水', '発電', '消流雪用水', 'レクリエーション'];
                            const dam_type = ['アーチダム', 'バットレスダム', 'アースダム', 'アスファルトフェイシングダム', 'アスファルトコアダム', 'フローティングゲートダム', '重力式コンクリートダム', '重力式アーチダム', '重力式コンクリートダム・フィルダム複合ダム', '中空重力式コンクリートダム', 'マルティプルアーチダム', 'ロックフィルダム', '台形CSGダム'];

                            // ダムを選ぶ乱数
                            while (true) {
                                var random = Math.floor( Math.random() * Dam_data['ksj:Dataset']['ksj:Dam'].length);
                                var target_dam = Dam_data['ksj:Dataset']['ksj:Dam'][random];
                                break;
                            };

                            let purposes = target_dam['ksj:purpose'];
                            if (typeof purposes === 'object') {
                                target_purpose = dam_purpose[target_dam['ksj:purpose'][0] - 1];
                                for (let i=1 ; i < purposes.length ; i++) {
                                    target_purpose = target_purpose + '・' + dam_purpose[target_dam['ksj:purpose'][i] - 1];
                                };
                            } else {
                                target_purpose = dam_purpose[target_dam['ksj:purpose'] - 1];
                            };

                            let target_address = target_dam['ksj:address'];
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
                        };

                        if (event.message.text == '選手クイズ') {
                            bot.pushMessage(event.source.groupId, {
                                type: "text",
                                text: "選手クイズ！張り切っていきましょー！"
                            });


                            // 手選を選ぶ乱数
                            var random = Math.floor( Math.random() * baseball.length);

                            // ヒントを提出
                            setTimeout(() => {
                                bot.pushMessage(event.source.groupId, {
                                    type: "text",
                                    text: "投打：" + baseball[random][3].toda
                                });
                                setTimeout(() => {
                                    bot.pushMessage(event.source.groupId, {
                                    type: "text",
                                    text: "身長体重：" + baseball[random][4].height_weight
                                    });
                                    setTimeout(() => {
                                        bot.pushMessage(event.source.groupId, {
                                        type: "text",
                                        text: "生年月日：" + baseball[random][5].born
                                        });
                                        setTimeout(() => {
                                            bot.pushMessage(event.source.groupId, {
                                            type: "text",
                                            text: "ポジション：" + baseball[random][2].position
                                            });
                                            setTimeout(() => {
                                                bot.pushMessage(event.source.groupId, {
                                                type: "text",
                                                text: "ドラフト：" + baseball[random][7].draft
                                                });
                                                setTimeout(() => {
                                                    bot.pushMessage(event.source.groupId, {
                                                    type: "text",
                                                    text: "経歴：" + baseball[random][6].career
                                                    });
                                                    setTimeout(() => {
                                                        bot.pushMessage(event.source.groupId, {
                                                        type: "text",
                                                        text: "所属チーム：" + baseball[random][0].team
                                                        });
                                                        setTimeout(() => {
                                                            bot.pushMessage(event.source.groupId, {
                                                            type: "text",
                                                            text: "正解は" + baseball[random][1].name + "選手でした〜"
                                                            });
                                                        }, 10000);
                                                    }, 6000);
                                                }, 6000);
                                            }, 6000);
                                        }, 6000);
                                    }, 6000);
                                }, 6000);
                            }, 1000);
                        };
                        
                        if (message.text == '成績クイズ') {
                            bot.pushMessage(event.source.groupId, {
                                type: 'text',
                                text: '成績クイズ！張り切っていきましょー！出題は近5年だよー！'
                            });
                            // 過去5年1軍出場が無い選手は飛ばす
                            while(true) {
                                // 選手を選ぶ乱数
                            	var random = Math.floor( Math.random() * baseball.length);
                                if ( baseball[random][8].indexOf('2014') || baseball[random][8].indexOf('2015') || baseball[random][8].indexOf('2016') ||  baseball[random][8].indexOf('2017') ||  baseball[random][8].indexOf('2018')) {
                                    break;
                                };
                            };
                            
							if(baseball[random][2].position = "投手"){
	                            // 10秒に1回ヒントを提出
	                            setTimeout(() => {
	                            	var list_no_5 = baseball[random][8].indexOf('2014')
	                                if (list_no_5 != null) {
	                                    bot.pushMessage(event.source.groupId, {
	                                        type: 'text',
	                                        text: '2014年' + '\n　チーム：' + baseball[random][8][list_no_5 + 1] + '\n　' + baseball[random][8][list_no_5 + 2] + '試合\n　' + baseball[random][8][list_no_5 + 3] + '勝\n　：' + baseball[random][8][list_no_5 + 4] + '敗\n　：' + baseball[random][8][list_no_5 + 5] + 'セーブ\n　：' + baseball[random][8][list_no_5 + 6]+ 'ホールド\n　防御率：' + baseball[random][8][list_no_5 + 7]
	                                    });
	                                } else {
	                                    bot.pushMessage(event.source.groupId, {
	                                        type: 'text',
	                                        text: '2014年：1軍出場無し'
	                                    });
	                                };
	                                setTimeout(() => {
	                            		var list_no_4 = baseball[random][8].indexOf('2015')
	                                	if (list_no_4 != null) {
	                                    	bot.pushMessage(event.source.groupId, {
	                                        	type: 'text',
	                                        	text: '2015年' + '\n　チーム：' + baseball[random][8][list_no_4 + 1] + '\n　' + baseball[random][8][list_no_4 + 2] + '試合\n　' + baseball[random][8][list_no_4 + 3] + '勝\n　：' + baseball[random][8][list_no_4 + 4] + '敗\n　：' + baseball[random][8][list_no_4 + 5] + 'セーブ\n　：' + baseball[random][8][list_no_4 + 6]+ 'ホールド\n　防御率：' + baseball[random][8][list_no_4 + 7]
	                                    	});
	                                	} else {
	                                    	bot.pushMessage(event.source.groupId, {
	                                        	type: 'text',
	                                        	text: '2015年：1軍出場無し'
	                                    	});
	                                	};
	                                    setTimeout(() => {
	                            			var list_no_3 = baseball[random][8].indexOf('2016')
	                                		if (list_no_3 != null) {
	                                    		bot.pushMessage(event.source.groupId, {
	                                        		type: 'text',
	                                        		text: '2016年' + '\n　チーム：' + baseball[random][8][list_no_3 + 1] + '\n　' + baseball[random][8][list_no_3 + 2] + '試合\n　' + baseball[random][8][list_no_3 + 3] + '勝\n　：' + baseball[random][8][list_no_3 + 4] + '敗\n　：' + baseball[random][8][list_no_3 + 5] + 'セーブ\n　：' + baseball[random][8][list_no_3 + 6]+ 'ホールド\n　防御率：' + baseball[random][8][list_no_3 + 7]
	                                    		});
	                                		} else {
	                                    		bot.pushMessage(event.source.groupId, {
	                                        		type: 'text',
	                                        		text: '2016年：1軍出場無し'
	                                    		});
	                                		};
	                                        setTimeout(() => {
	                            				var list_no_2 = baseball[random][8].indexOf('2017')
	                                			if (list_no_2 != null) {
	                                    			bot.pushMessage(event.source.groupId, {
	                                        			type: 'text',
	                                        			text: '2017年' + '\n　チーム：' + baseball[random][8][list_no_2 + 1] + '\n　' + baseball[random][8][list_no_2 + 2] + '試合\n　' + baseball[random][8][list_no_2 + 3] + '勝\n　：' + baseball[random][8][list_no_2 + 4] + '敗\n　：' + baseball[random][8][list_no_2 + 5] + 'セーブ\n　：' + baseball[random][8][list_no_2 + 6]+ 'ホールド\n　防御率：' + baseball[random][8][list_no_2 + 7]
	                                    			});
	                                			} else {
	                                    			bot.pushMessage(event.source.groupId, {
	                                        			type: 'text',
	                                        			text: '2017年：1軍出場無し'
	                                    			});
	                                			};
	                                            setTimeout(() => {
	                            					var list_no_1 = baseball[random][8].indexOf('2018')
	                                				if (list_no_1 != null) {
	                                    				bot.pushMessage(event.source.groupId, {
	                                        				type: 'text',
	                                        				text: '2018年' + '\n　チーム：' + baseball[random][8][list_no_1 + 1] + '\n　' + baseball[random][8][list_no_1 + 2] + '試合\n　' + baseball[random][8][list_no_1 + 3] + '勝\n　：' + baseball[random][8][list_no_1 + 4] + '敗\n　：' + baseball[random][8][list_no_1 + 5] + 'セーブ\n　：' + baseball[random][8][list_no_1 + 6]+ 'ホールド\n　防御率：' + baseball[random][8][list_no_1 + 7]
	                                    				});
	                                				} else {
	                                    				bot.pushMessage(event.source.groupId, {
	                                        				type: 'text',
	                                        				text: '2018年：1軍出場無し'
	                                    				});
	                                				};
	                                                setTimeout(() => {
	                                                    bot.pushMessage(event.source.groupId, {
	                                                    	type: "text",
	                                                        text: "正解は" + baseball[random][1].name + "選手でした〜"
	                                                    });
	                                                }, 10000);
	                                            }, 5000);
	                                        }, 5000);
	                                    }, 5000);
	                                }, 5000);
	                            }, 1000);
	                    	}else{
	                    		// 10秒に1回ヒントを提出
	                            setTimeout(() => {
	                            	var list_no_5 = baseball[random][8].indexOf('2014')
	                                if (list_no_5 != null) {
	                                    bot.pushMessage(event.source.groupId, {
	                                        type: 'text',
	                                        text: '2014年' + '\n　チーム：' + baseball[random][8][list_no_5 + 1] + '\n　' + baseball[random][8][list_no_5 + 2] + '試合\n　' + baseball[random][8][list_no_5 + 3] + '打席\n　安打：' + baseball[random][8][list_no_5 + 4] + '本\n　HR：' + baseball[random][8][list_no_5 + 5] + '本\n　打点：' + baseball[random][8][list_no_5 + 6]+ '点\n　盗塁：' + baseball[random][8][list_no_5 + 7] + '個\n　打率：' + baseball[random][8][list_no_5 + 8]
	                                    });
	                                } else {
	                                    bot.pushMessage(event.source.groupId, {
	                                        type: 'text',
	                                        text: '2014年：1軍出場無し'
	                                    });
	                                };
	                                setTimeout(() => {
	                            		var list_no_4 = baseball[random][8].indexOf('2015')
	                                	if (list_no_4 != null) {
	                                    	bot.pushMessage(event.source.groupId, {
	                                        	type: 'text',
	                                        	text: '2015年' + '\n　チーム：' + baseball[random][8][list_no_4 + 1] + '\n　' + baseball[random][8][list_no_4 + 2] + '試合\n　' + baseball[random][8][list_no_4 + 3] + '打席\n　安打：' + baseball[random][8][list_no_4 + 4] + '本\n　HR：' + baseball[random][8][list_no_4 + 5] + '本\n　打点：' + baseball[random][8][list_no_4 + 6]+ '点\n　盗塁：' + baseball[random][8][list_no_4 + 7] + '個\n　打率：' + baseball[random][8][list_no_4 + 8]
	                                        });
	                                	} else {
	                                    	bot.pushMessage(event.source.groupId, {
	                                        	type: 'text',
	                                        	text: '2015年：1軍出場無し'
	                                    	});
	                                	};
	                                    setTimeout(() => {
	                            			var list_no_3 = baseball[random][8].indexOf('2016')
	                                		if (list_no_3 != null) {
	                                    		bot.pushMessage(event.source.groupId, {
	                                        		type: 'text',
	                                        		text: '2016年' + '\n　チーム：' + baseball[random][8][list_no_3 + 1] + '\n　' + baseball[random][8][list_no_3 + 2] + '試合\n　' + baseball[random][8][list_no_3 + 3] + '打席\n　安打：' + baseball[random][8][list_no_3 + 4] + '本\n　HR：' + baseball[random][8][list_no_3 + 5] + '本\n　打点：' + baseball[random][8][list_no_3 + 6]+ '点\n　盗塁：' + baseball[random][8][list_no_3 + 7] + '個\n　打率：' + baseball[random][8][list_no_3 + 8]
	                                        	});
	                                		} else {
	                                    		bot.pushMessage(event.source.groupId, {
	                                        		type: 'text',
	                                        		text: '2016年：1軍出場無し'
	                                    		});
	                                		};
	                                        setTimeout(() => {
	                            				var list_no_2 = baseball[random][8].indexOf('2017')
	                                			if (list_no_2 != null) {
	                                    			bot.pushMessage(event.source.groupId, {
	                                        			type: 'text',
	                                        			text: '2017年' + '\n　チーム：' + baseball[random][8][list_no_2 + 1] + '\n　' + baseball[random][8][list_no_2 + 2] + '試合\n　' + baseball[random][8][list_no_2 + 3] + '打席\n　安打：' + baseball[random][8][list_no_2 + 4] + '本\n　HR：' + baseball[random][8][list_no_2 + 5] + '本\n　打点：' + baseball[random][8][list_no_2 + 6]+ '点\n　盗塁：' + baseball[random][8][list_no_2 + 7] + '個\n　打率：' + baseball[random][8][list_no_2 + 8]
	                                        		});
	                                			} else {
	                                    			bot.pushMessage(event.source.groupId, {
	                                        			type: 'text',
	                                        			text: '2017年：1軍出場無し'
	                                    			});
	                                			};
	                                            setTimeout(() => {
	                            					var list_no_1 = baseball[random][8].indexOf('2018')
	                                				if (list_no_1 != null) {
	                                    				bot.pushMessage(event.source.groupId, {
	                                        				type: 'text',
	                                        				text: '2018年' + '\n　チーム：' + baseball[random][8][list_no_1 + 1] + '\n　' + baseball[random][8][list_no_1 + 2] + '試合\n　' + baseball[random][8][list_no_1 + 3] + '打席\n　安打：' + baseball[random][8][list_no_1 + 4] + '本\n　HR：' + baseball[random][8][list_no_1 + 5] + '本\n　打点：' + baseball[random][8][list_no_1 + 6]+ '点\n　盗塁：' + baseball[random][8][list_no_1 + 7] + '個\n　打率：' + baseball[random][8][list_no_1 + 8]
	                                        			});
	                                				} else {
	                                    				bot.pushMessage(event.source.groupId, {
	                                        				type: 'text',
	                                        				text: '2018年：1軍出場無し'
	                                    				});
	                                				};
	                                                setTimeout(() => {
	                                                    bot.pushMessage(event.source.groupId, {
	                                                    	type: "text",
	                                                        text: "正解は" + baseball[random][1].name + "選手でした〜"
	                                                    });
	                                                }, 10000);
	                                            }, 5000);
	                                        }, 5000);
	                                    }, 5000);
	                                }, 5000);
	                            }, 1000);
	                    	};
                        };
                        break;

                    // フォロー時のメッセージ
                    case 'follow':
                        bot.pushMessage(event.replyToken, {
                            type: 'text',
                            text: 'フォローありがとう！よろしくね！'
                        });
                        break;

                    // グループ追加時のメッセージ
                    case 'join':
                        bot.pushMessage(event.replyToken, {
                            type: 'text',
                            text: '招待ありがとう！よろしくね！'
                        });
                        break;
                };
                break;
        };
    });
});
