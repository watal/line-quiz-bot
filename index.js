"use strict";

// モジュールのインポート
const line = require('@line/bot-sdk'); // Messaging APIのSDK
const express = require('express')(); // Express

// 環境変数からLINE SDK用のパラメータ設定
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN, // アクセストークン
  channelSecret: process.env.LINE_CHANNEL_SECRET // Channel Secret
};

// Webサーバ設定
express.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(config);

// webhook設定
express.post('/webhook', line.middleware(config), (req, res, next) => {
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
  const cnvPattern = require('./data/conversation/pattern.json');
  const netkeibaQuiz2013 = require('./data/json_data/netkeiba_2013.json');
  const netkeibaQuiz2014 = require('./data/json_data/netkeiba_2014.json');
  const netkeibaQuiz2015 = require('./data/json_data/netkeiba_2015.json');
  const netkeibaQuiz2016 = require('./data/json_data/netkeiba_2016.json');
  const netkeibaQuiz = [netkeibaQuiz2013, netkeibaQuiz2014, netkeibaQuiz2015, netkeibaQuiz2016];
  const baseball = require('./data/json_data/baseball_player.json');
  const damData = require('./data/json_data/Dam.json');

  // テキストメッセージ処理関数
  function handleText(message, event) {
    // クイズ
    if (message.text === '血統クイズ') {
      bot.pushMessage(event.source.groupId, {
        type: 'text',
        text: '血統クイズ！張り切っていきましょー！'
      });

      // 年度を選ぶ乱数
      let quizYear = Math.floor(Math.random() * 4);
      let trueYear = quizYear + 2013;
      // 要素を選ぶ乱数 □地・の20XX系と獲得賞金0万円は飛ばす
      while (true) {
        var random = Math.floor(Math.random() * netkeibaQuiz[quizYear].length);
        var targetYear = netkeibaQuiz[quizYear][random];
        let nameKey = 'の' + trueYear;
        let nameString = targetYear[1].name;
        if (nameString.indexOf('□地') && !((nameString.lastIndexOf(nameKey) + nameKey.length === nameString.length) && (nameKey.length <= nameString.length)) && targetYear[3].money !== '0万円' && targetYear[3].money !== '-') {
          break;
        };
      };
      // 10秒に1回ヒントを提出
      setTimeout(() => {
        bot.pushMessage(event.source.groupId, {
          type: 'text',
          text: '母父：' + targetYear[6].b_sire
        });
        setTimeout(() => {
          bot.pushMessage(event.source.groupId, {
            type: 'text',
            text: '母：' + targetYear[5].mother
          });
          setTimeout(() => {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '父：' + targetYear[4].father
            });
            setTimeout(() => {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '生年月日：' + targetYear[2].birthday
              });
              setTimeout(() => {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '正解は' + targetYear[1].name + 'でした〜'
                });
              }, 10000);
            }, 6000);
          }, 6000);
        }, 6000);
      }, 1000);

    } else if (message.text === '戦績クイズ') {
      bot.pushMessage(event.source.groupId, {
        type: 'text',
        text: '戦績クイズ！張り切っていきましょー！出題は近5走だよー！'
      });

      // 年度を選ぶ乱数
      let quizYear = Math.floor(Math.random() * 4);
      let trueYear = quizYear + 2013;
      // 要素を選ぶ乱数 □地・○地・の20XX系と獲得賞金0万円は飛ばす
      while (true) {
        var random = Math.floor(Math.random() * netkeibaQuiz[quizYear].length);
        var targetYear = netkeibaQuiz[quizYear][random];
        let nameKey = 'の' + trueYear;
        let nameString = targetYear[1].name;
        if (nameString.indexOf('□地') && nameString.indexOf('○地') && !((nameString.lastIndexOf(nameKey) + nameKey.length === nameString.length) && (nameKey.length <= nameString.length)) && targetYear[3].money !== '0万円' && targetYear[3].money !== '-' && targetYear[7].length >= 6) {
          break;
        };
      };

      // 5走前，4走前，3走前，2走前の待ち時間
      const waitTimes = [6000, 6000, 6000, 6000];
      if (targetYear[7][24] === null) { waitTimes[0] = 3000 };
      if (targetYear[7][18] === null) { waitTimes[1] = 3000 };
      if (targetYear[7][12] === null) { waitTimes[2] = 3000 };
      if (targetYear[7][6] === null) { waitTimes[3] = 3000 };

      // 10秒に1回ヒントを提出
      setTimeout(() => {
        if (targetYear[7][24] !== null) {
          bot.pushMessage(event.source.groupId, {
            type: 'text',
            text: '5走前：\n　日付：' + targetYear[7][24].race_ymd + '\n　開催：' + targetYear[7][25].race_place + '\n　名称：' + targetYear[7][26].race_name + '\n　着順：' + targetYear[7][27].race_result + '着\n　鞍上：' + targetYear[7][28].race_jockey + '\n　条件：' + targetYear[7][29].race_conditions
          });
        } else {
          bot.pushMessage(event.source.groupId, {
            type: 'text',
            text: '5走前：なし'
          });
        };
        setTimeout(() => {
          if (targetYear[7][18] !== null) {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '4走前：\n　日付：' + targetYear[7][18].race_ymd + '\n　開催：' + targetYear[7][19].race_place + '\n　名称：' + targetYear[7][20].race_name + '\n　着順：' + targetYear[7][21].race_result + '着\n　鞍上：' + targetYear[7][22].race_jockey + '\n　条件：' + targetYear[7][23].race_conditions
            });
          } else {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '4走前：なし'
            });
          };
          setTimeout(() => {
            if (targetYear[7][12] !== null) {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '3走前：\n　日付：' + targetYear[7][12].race_ymd + '\n　開催：' + targetYear[7][13].race_place + '\n　名称：' + targetYear[7][14].race_name + '\n　着順：' + targetYear[7][15].race_result + '着\n　鞍上：' + targetYear[7][16].race_jockey + '\n　条件：' + targetYear[7][17].race_conditions
              });
            } else {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '3走前：なし'
              });
            };
            setTimeout(() => {
              if (targetYear[7][6] !== null) {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '2走前：\n　日付：' + targetYear[7][6].race_ymd + '\n　開催：' + targetYear[7][7].race_place + '\n　名称：' + targetYear[7][8].race_name + '\n　着順：' + targetYear[7][9].race_result + '着\n　鞍上：' + targetYear[7][10].race_jockey + '\n　条件：' + targetYear[7][11].race_conditions
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
                  text: '前走：\n　日付：' + targetYear[7][0].race_ymd + '\n　開催：' + targetYear[7][1].race_place + '\n　名称：' + targetYear[7][2].race_name + '\n　着順：' + targetYear[7][3].race_result + '着\n　鞍上：' + targetYear[7][4].race_jockey + '\n　条件：' + targetYear[7][5].race_conditions
                });
                setTimeout(() => {
                  bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '正解は' + targetYear[1].name + 'でした〜'
                  });
                }, 10000);
              }, waitTimes[3]);
            }, waitTimes[2]);
          }, waitTimes[1]);
        }, waitTimes[0]);
      }, 1000);

    } else if (message.text === 'ダムクイズ') {
      bot.pushMessage(event.source.groupId, {
        type: 'text',
        text: 'ダムクイズ！張り切っていきましょー！'
      });
      const damPurpose = ['洪水調整，農地防災', '不特定用水，河川維持用水', '灌漑，特定（新規）灌漑用水', '上水道用水', '工業用水道用水', '発電', '消流雪用水', 'レクリエーション'];
      const damType = ['アーチダム', 'バットレスダム', 'アースダム', 'アスファルトフェイシングダム', 'アスファルトコアダム', 'フローティングゲートダム', '重力式コンクリートダム', '重力式アーチダム', '重力式コンクリートダム・フィルダム複合ダム', '中空重力式コンクリートダム', 'マルティプルアーチダム', 'ロックフィルダム', '台形CSGダム'];

      // ダムを選ぶ乱数
      while (true) {
        var random = Math.floor(Math.random() * damData['ksj:Dataset']['ksj:Dam'].length);
        var targetDam = damData['ksj:Dataset']['ksj:Dam'][random];

        // 難易度調整のためアースダムを除外
        if (targetDam['ksj:type'] !== 3) {
          break;
        };
      };

      let purposes = targetDam['ksj:purpose'];
      let targetPurpose;
      if (typeof purposes === 'object') {
        targetPurpose = damPurpose[targetDam['ksj:purpose'][0] - 1];
        for (let i = 1; i < purposes.length; i++) {
          targetPurpose = targetPurpose + '・' + damPurpose[targetDam['ksj:purpose'][i] - 1];
        };
      } else {
        targetPurpose = damPurpose[targetDam['ksj:purpose'] - 1];
      };

      let targetAddress = targetDam['ksj:address'];
      let prefecture = targetAddress
      // 都道府県のみに制限する正規表現
      // let prefecture = targetAddress.match(/.{2,3}?[都道府県]/);

      // ヒントを提出
      setTimeout(() => {
        bot.pushMessage(event.source.groupId, {
          type: 'text',
          text: '目的：' + targetPurpose
        });
        setTimeout(() => {
          bot.pushMessage(event.source.groupId, {
            type: 'text',
            text: '総貯水量：' + targetDam['ksj:totalPondage'] + '千㎥'
          });
          setTimeout(() => {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '型式：' + damType[targetDam['ksj:type'] - 1]
            });
            setTimeout(() => {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '水系：' + targetDam['ksj:waterSystemName']
              });
              setTimeout(() => {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '所在地：' + prefecture
                });
                setTimeout(() => {
                  bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '正解は' + targetDam['ksj:damName'] + 'ダムでした〜'
                  });
                }, 10000);
              }, 6000);
            }, 6000);
          }, 6000);
        }, 6000);
      }, 1000);

    } else if (message.text === '選手クイズ') {
      bot.pushMessage(event.source.groupId, {
        type: "text",
        text: "選手クイズ！張り切っていきましょー！"
      });

      // 選手を選ぶ乱数
      var random = Math.floor(Math.random() * baseball.length);

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

    } else if (message.text === '成績クイズ') {
      bot.pushMessage(event.source.groupId, {
        type: 'text',
        text: '成績クイズ！張り切っていきましょー！出題は近5年だよー！'
      });

      // 過去5年1軍出場が無い選手は飛ばす
      while (true) {
        // 選手を選ぶ乱数
        var random = Math.floor(Math.random() * baseball.length);
        var list2014 = baseball[random][8].findIndex(({ year }) => year === '2014');
        var list2015 = baseball[random][8].findIndex(({ year }) => year === '2015');
        var list2016 = baseball[random][8].findIndex(({ year }) => year === '2016');
        var list2017 = baseball[random][8].findIndex(({ year }) => year === '2017');
        var list2018 = baseball[random][8].findIndex(({ year }) => year === '2018');
        if (list2014 !== -1 || list2015 !== -1 || list2016 !== -1 || list2017 !== -1 || list2018 !== -1) {
          break;
        };
      };

      if (baseball[random][2].position === "投手") {
        // 10秒に1回ヒントを提出
        setTimeout(() => {
          if (list2014 !== -1) {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '2014年' + '\n　チーム：' + baseball[random][8][list2014 + 1].team + '\n　' + baseball[random][8][list2014 + 2].game + '試合\n　' + baseball[random][8][list2014 + 3].win + '勝\n　：' + baseball[random][8][list2014 + 4].lose + '敗\n　：' + baseball[random][8][list2014 + 5].save + 'セーブ\n　：' + baseball[random][8][list2014 + 6].hold + 'ホールド\n　防御率：' + baseball[random][8][list2014 + 7].ERA
            });
          } else {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '2014年：1軍出場無し'
            });
          };
          setTimeout(() => {
            if (list2015 !== -1) {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '2015年' + '\n　チーム：' + baseball[random][8][list2015 + 1].team + '\n　' + baseball[random][8][list2015 + 2].game + '試合\n　' + baseball[random][8][list2015 + 3].win + '勝\n　：' + baseball[random][8][list2015 + 4].lose + '敗\n　：' + baseball[random][8][list2015 + 5].save + 'セーブ\n　：' + baseball[random][8][list2015 + 6].hold + 'ホールド\n　防御率：' + baseball[random][8][list2015 + 7].ERA
              });
            } else {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '2015年：1軍出場無し'
              });
            };
            setTimeout(() => {
              if (list2016 !== -1) {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '2016年' + '\n　チーム：' + baseball[random][8][list2016 + 1].team + '\n　' + baseball[random][8][list2016 + 2].game + '試合\n　' + baseball[random][8][list2016 + 3].win + '勝\n　：' + baseball[random][8][list2016 + 4].lose + '敗\n　：' + baseball[random][8][list2016 + 5].save + 'セーブ\n　：' + baseball[random][8][list2016 + 6].hold + 'ホールド\n　防御率：' + baseball[random][8][list2016 + 7].ERA
                });
              } else {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '2016年：1軍出場無し'
                });
              };
              setTimeout(() => {
                if (list2017 !== -1) {
                  bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '2017年' + '\n　チーム：' + baseball[random][8][list2017 + 1].team + '\n　' + baseball[random][8][list2017 + 2].game + '試合\n　' + baseball[random][8][list2017 + 3].win + '勝\n　：' + baseball[random][8][list2017 + 4].lose + '敗\n　：' + baseball[random][8][list2017 + 5].save + 'セーブ\n　：' + baseball[random][8][list2017 + 6].hold + 'ホールド\n　防御率：' + baseball[random][8][list2017 + 7].ERA
                  });
                } else {
                  bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '2017年：1軍出場無し'
                  });
                };
                setTimeout(() => {
                  if (list2018 !== -1) {
                    bot.pushMessage(event.source.groupId, {
                      type: 'text',
                      text: '2018年' + '\n　チーム：' + baseball[random][8][list2018 + 1].team + '\n　' + baseball[random][8][list2018 + 2].game + '試合\n　' + baseball[random][8][list2018 + 3].win + '勝\n　：' + baseball[random][8][list2018 + 4].lose + '敗\n　：' + baseball[random][8][list2018 + 5].save + 'セーブ\n　：' + baseball[random][8][list2018 + 6].hold + 'ホールド\n　防御率：' + baseball[random][8][list2018 + 7].ERA
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
      } else {
        // 10秒に1回ヒントを提出
        setTimeout(() => {
          if (list2014 !== -1) {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '2014年' + '\n　チーム：' + baseball[random][8][list2014 + 1].team + '\n　' + baseball[random][8][list2014 + 2].game + '試合\n　' + baseball[random][8][list2014 + 3].bat + '打席\n　安打：' + baseball[random][8][list2014 + 4].hits + '本\n　HR：' + baseball[random][8][list2014 + 5].HR + '本\n　打点：' + baseball[random][8][list2014 + 6].RBI + '点\n　盗塁：' + baseball[random][8][list2014 + 7].SB + '個\n　打率：' + baseball[random][8][list2014 + 8].AVG
            });
          } else {
            bot.pushMessage(event.source.groupId, {
              type: 'text',
              text: '2014年：1軍出場無し'
            });
          };
          setTimeout(() => {
            if (list2015 !== -1) {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '2015年' + '\n　チーム：' + baseball[random][8][list2015 + 1].team + '\n　' + baseball[random][8][list2015 + 2].game + '試合\n　' + baseball[random][8][list2015 + 3].bat + '打席\n　安打：' + baseball[random][8][list2015 + 4].hits + '本\n　HR：' + baseball[random][8][list2015 + 5].HR + '本\n　打点：' + baseball[random][8][list2015 + 6].RBI + '点\n　盗塁：' + baseball[random][8][list2015 + 7].SB + '個\n　打率：' + baseball[random][8][list2015 + 8].AVG
              });
            } else {
              bot.pushMessage(event.source.groupId, {
                type: 'text',
                text: '2015年：1軍出場無し'
              });
            };
            setTimeout(() => {
              if (list2016 !== -1) {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '2016年' + '\n　チーム：' + baseball[random][8][list2016 + 1].team + '\n　' + baseball[random][8][list2016 + 2].game + '試合\n　' + baseball[random][8][list2016 + 3].bat + '打席\n　安打：' + baseball[random][8][list2016 + 4].hits + '本\n　HR：' + baseball[random][8][list2016 + 5].HR + '本\n　打点：' + baseball[random][8][list2016 + 6].RBI + '点\n　盗塁：' + baseball[random][8][list2016 + 7].SB + '個\n　打率：' + baseball[random][8][list2016 + 8].AVG
                });
              } else {
                bot.pushMessage(event.source.groupId, {
                  type: 'text',
                  text: '2016年：1軍出場無し'
                });
              };
              setTimeout(() => {
                if (list2017 !== -1) {
                  bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '2017年' + '\n　チーム：' + baseball[random][8][list2017 + 1].team + '\n　' + baseball[random][8][list2017 + 2].game + '試合\n　' + baseball[random][8][list2017 + 3].bat + '打席\n　安打：' + baseball[random][8][list2017 + 4].hits + '本\n　HR：' + baseball[random][8][list2017 + 5].HR + '本\n　打点：' + baseball[random][8][list2017 + 6].RBI + '点\n　盗塁：' + baseball[random][8][list2017 + 7].SB + '個\n　打率：' + baseball[random][8][list2017 + 8].AVG
                  });
                } else {
                  bot.pushMessage(event.source.groupId, {
                    type: 'text',
                    text: '2017年：1軍出場無し'
                  });
                };
                setTimeout(() => {
                  if (list2018 !== -1) {
                    bot.pushMessage(event.source.groupId, {
                      type: 'text',
                      text: '2018年' + '\n　チーム：' + baseball[random][8][list2018 + 1].team + '\n　試合数：' + baseball[random][8][list2018 + 2].game + '試合\n　' + baseball[random][8][list2018 + 3].bat + '打席\n　安打：' + baseball[random][8][list2018 + 4].hits + '本\n　HR：' + baseball[random][8][list2018 + 5].HR + '本\n　打点：' + baseball[random][8][list2018 + 6].RBI + '点\n　盗塁：' + baseball[random][8][list2018 + 7].SB + '個\n　打率：' + baseball[random][8][list2018 + 8].AVG
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

    } else {
      // 1対1の会話パターン
      for (let i in cnvPattern) {
        let matchPattern;
        if (cnvPattern[i][0] === 0) {
          // 配列の第0要素が1なら完全一致
          matchPattern = new RegExp('^' + cnvPattern[i][1] + '$');
          // 配列の第0要素が1なら部分一致
        } else if (cnvPattern[i][0] === 1) {
          matchPattern = new RegExp('.*' + cnvPattern[i][1] + '.*');
          // 配列の第0要素が2なら前方一致
        } else if (cnvPattern[i][0] === 2) {
          matchPattern = new RegExp('^' + cnvPattern[i][1] + '.*');
          // 配列の第0要素が3なら後方一致
        } else if (cnvPattern[i][0] === 3) {
          matchPattern = new RegExp('.*' + cnvPattern[i][1] + '$');
        };
        if (message.text.match(matchPattern)) {
          bot.replyMessage(event.replyToken, {
            type: 'text',
            text: cnvPattern[i][2]
          });
        };
      };
    };
  };

  // イベントを順次処理
  req.body.events.forEach((event) => {
    // イベントタイプごとに処理を決定
    switch (event.type) {
      case 'message':
        let message = event.message;
        switch (message.type) {
          // テキストメッセージに返信
          case 'text':
            handleText(message, event);
            break;
        };
        break;

        // フォロー時のメッセージ
      case 'follow':
        bot.pushMessage(event.source.userId, {
          type: 'text',
          text: 'フォローありがとう！よろしくね！'
        });
        break;

        // グループ追加時のメッセージ
      case 'join':
        bot.pushMessage(event.source.groupId, {
          type: 'text',
          text: '招待ありがとう！よろしくね！'
        });
        break;
    };
  });
});
