/*Copyright 2017 [name of copyright owner]

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.*/

'use strict';
var WebSocketServer = require('websocket').server;
var noop = require('node-noop').noop;
var _ = require('lodash');

var callback_list = [];

module.exports = function (server) {
  var wsServer = new WebSocketServer({
    httpServer: server,
    maxReceivedFrameSize: 0x100000,
    autoAcceptConnections: false
  });
  /*
   player:{
   name:xxx,
   status: dead, alive
   }

   vote:{
   "voter":namexxx,
   "byVoter": nameyyy
   }
   */
  // var players = [{"name":"王龙生", "status":"alive"}, {"name":"黄楚杰", "status":"alive"},{"name":"大声道", "status":"dead"}];
  var players = [];
  var votes = [];


  function notifyAllPlayers(){
    let ret =  {"channel":"PLAYERS","msg":players};
    callback_list.forEach(function (ele) {
      ele.callback(JSON.stringify(ret));
    });
  }

  function notifyAllVotes(){
    let ret =  {"channel":"VOTES","msg":votes};
    callback_list.forEach(function (ele) {
      let index = _.findIndex(votes,(obj) => {
        return _.isEqual(obj.voter, ele.name);
      });
      if(index !== -1){
        ele.callback(JSON.stringify(ret))
      } else {
        players.forEach((player)=>{
          if(player.name === ele.name && player.status === "dead"){
            ele.callback(JSON.stringify(ret))
          }
        })

      }
    });
  }

  // function notifyAllPlayersToClient() {
  //
  // }


  wsServer.on('request', function (request) {
    var cookies = request.cookies;
    console.log(cookies);
    var connection = request.accept(null, request.origin);
    var playerName = _.filter(cookies,{"name": '__name__'})[0].value;

    function reply(response) {
      if (!connection.connected) {
        return false;
      } else {
        connection.sendUTF(response);
      }
      return true;
    }

    callback_list.push({"name":playerName, "callback":reply});

    console.log("玩家【"+ playerName+"】已经加入");


    function handleMessage(message) {
      var messageData = {}, reply,index;
      try {
        messageData = JSON.parse(message.utf8Data);
      } catch (e) {
        messageData = {};
        messageData.error = "Message received from Logstash has malformed JSON";
        connection.sendUTF(JSON.stringify(messageData));
        return;
      }
      // var region = cookies.find(function (cookie) {
      //   return cookie.name === "region";
      // });
      // if (!messageData.msg.name) {
      //   messageData = {};
      //   messageData.error = "要输入你的大名哦！";
      //   connection.sendUTF(JSON.stringify(messageData));
      //   return;
      // }
      // var region_id = region.value;
      switch (messageData.channel) {
        case "VOTE":
          // 1. 投票结束之后把当前的所有投票返回给自己
          index = _.findIndex(votes, (vote)=>{
            return _.isEqual(vote.voter, messageData.msg.voter);
          });
          if (index !== -1){
            return ;
          }
          votes.push(messageData.msg);
          
          // 2. 通知所有已经投票的同学
          notifyAllVotes();
          // 3. 判断投票是否结束
          let alivePlayers = _.filter(players, {status:"alive"});
          if(votes.length === alivePlayers.length){
            votes = [];
            // callback_list = [];
            players = [];
          }
          break;
        case "LOGIN":
          let ret1 =  {"channel":"PLAYERS","msg":players};
          // let ret =  {"channel":"PLAYERS","msg":players};
          connection.sendUTF(JSON.stringify(ret1));

          let curStatus ="" ;
          players.forEach((player)=>{
            if(player.name === playerName){
              curStatus = player.status;
            }
          })

          let ret2 =  {"channel":"VOTES","msg":votes};
          if(curStatus === "dead"){
            connection.sendUTF(JSON.stringify(ret2));
          } else {
            votes.forEach((vote)=>{
              if(vote.voter === playerName){
                connection.sendUTF(JSON.stringify(ret2));
              }
            })
          }
          break;
        case "READY":
          //登录时
          // 1.加入到players数组中
          index = _.findIndex(players, (player)=>{
            return _.isEqual(player.name, playerName);
          })
          if (index === -1){
            players.push({"name":playerName,"status":"alive"});
          } else {
            if(votes.length === 0){
              players[index].status = "alive";
            }
          }

          // 2.返回当前所有的players
          notifyAllPlayers();
          // console.log(messageData);
          // let ret =  {"channel":"PLAYERS","msg":players}
          //
          // connection.sendUTF(JSON.stringify(ret));
          break;
        case "OBS":
          //登录时
          // 1.加入到players数组中
          index = _.findIndex(players, (player)=>{
            return _.isEqual(player.name, playerName);
          })
          if (index === -1){
            players.push({"name":playerName,"status":"dead"});
          } else {
            if(votes.length === 0){
              players[index].status = "dead";
            }
            // players[index].status = "dead";
          }

          notifyAllPlayers();
          break;
        case "CSTATUS":

          // 1. 改变自己的状态，同时通知所有人
          break;
        default:
          logger.error('Unable to match ws message to any known message types', message);
          var message = {};
          message.error = "The channel subscribed is not a valid channel: " + messageData.channel;
          connection.sendUTF(JSON.stringify(message));
          break;
      }
    }

    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        handleMessage(message);
      } else {
        connection.sendUTF('Only UTF-8 messages accepted');
      }
    });
    connection.on('close', function (reasonCode, description) {
      var indexToRemove = callback_list.findIndex((obj) => {
        return _.isEqual(obj.name, playerName);
      });
      callback_list.splice(indexToRemove, 1);
      //
      // indexToRemove = players.findIndex((obj) => {
      //   return _.isEqual(obj.name, playerName);
      // });
      // players.splice(indexToRemove, 1);

      // notifyAllPlayers();

      connection.close();
    });
  });
};
