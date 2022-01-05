var linebot = require('linebot');
var moment = require('moment');
var handle = require('./handle');
var logMessage = require('./logMessage');
let constLoc = require('./constant.js').locations;
var fs = require('fs');
var tw = require('taiwan-weather');

var Timestamp = Date.now();
//read config file
let config = JSON.parse(fs.readFileSync('./config.json'));
//read message file
let messageJson = JSON.parse(fs.readFileSync('./message.json'));


// check running mode
var debugMode = 0;
if (process.argv.length > 2){
	if(process.argv.indexOf("debug") !== -1)
		debugMode = 1;
}

// Line Channel info
var bot = linebot({
	channelId: config.channelId,
	channelSecret: config.channelSecret,
	channelAccessToken: config.channelAccessToken
  });
//print linebot info in debug mode
logMessage.log(debugMode, "DEBUG", `Linebot info: ${JSON.stringify(bot)}`);

bot.on("postback", function (event){
	console.log(event);
})


// message event trigger
bot.on('message', function (event) {
	try{
		event.source.profile().then(function (profile) {
			var userName = profile.displayName;
			logMessage.log(debugMode, "DEBUG", `event: ${JSON.stringify(event)}`);
			logMessage.log(debugMode, "DEBUG", `event.source.profile: ${JSON.stringify(profile)}`);
			switch(event.message.type){
				case 'text':
					//receive text process
					logMessage.log(debugMode, "DEBUG", `${userName} send \"${event.message.text.replace(/\r\n|\n/g,"\\n")}\"`);
					var items = event.message.text.split("\n");
					if(items[0] === "隨機選擇"){
						//隨機選擇事件
						ramdonChooseEvent(event, userName, items);
					}else if(items[0] === "button" && items.length === 1){
						
						logMessage.log(debugMode, "DEBUG", `${JSON.stringify(buttonTest())}`);
						event.reply(buttonTest()).then(function (data) {
							logMessage.log(debugMode, "INFO", `data: \"${JSON.stringify(data)}\"`);
						}).catch(function (error) {
							logMessage.log(debugMode, "ERROR", error);
						}); 
					}else if (items[0] === "天氣" && items.length === 3){
						// get weather msg
						
						// remove the specific item
						items = items.filter(item => item !== "天氣");
						// print the all item that will be choose by ramdon
						logMessage.log(debugMode, "INFO", "偵測\"天氣\"事件,地點為: "+items);
						getWeatherInfo(event, userName, items[0], items[1]);
						
					}
					break;
				case 'sticker':
					//receive sticker process
					logMessage.log(debugMode, "DEBUG", `${userName} send a sticker`);
					break;
				case 'image':
					//receive sticker process
					logMessage.log(debugMode, "DEBUG", `${userName} send a image`);
					break;
				case 'video':
					//receive sticker process
					logMessage.log(debugMode, "DEBUG", `${userName} send a video`);
					break;
				default:
					// receive other message type process ...[TBD]
					logMessage.log(debugMode, "DEBUG", `${userName} send something that message type does not define`);
			}
		});
	} catch(error){
		logMessage.log(debugMode, "ERROR", error);
	}
	
  
});

bot.listen('/linewebhook', 3000, function () {
	// print the current running mode
	debugMode?logMessage.log(debugMode, "INFO",'[linebot is ready!] (Debug)'):logMessage.log(debugMode, "INFO", '[linebot is ready!]');
	
});
//button message test
function buttonTest(){
	var actions = [{
		"type": "postback",
		"label": "button1",
		"data": "action=button1"
	  },
	  {
		"type": "postback",
		"label": "button2",
		"data": "action=button2"
	  },
	  {
		"type": "postback",
		"label": "button3",
		"data": "action=button3"
	  },
	  {
		  "type": "postback",
		  "label": "button4",
		  "data": "action=button4"
	  }];
	return handle.buttonHandle("測試", "請按按鈕", actions);
}

//隨機選擇事件處理
function ramdonChooseEvent(event, userName, items){
	// remove the specific item
	items = items.filter(item => item !== "隨機選擇");
	// print the all item that will be choose by ramdon
	logMessage.log(debugMode, "INFO", "偵測\"隨機選擇\"事件,選項包含: "+items);
	// check if any item lenth great than 10...
	if(items.filter(item => item.length > 10).length > 0){ 
		logMessage.log(debugMode, "ERROR", `選項大於10個字元`);
		var reqMessage = `Hi, ${userName} \n任意選項請不要超過10個字元！`;
	}else{
		var reqMessage = `Hi, ${userName} \n你的隨機選擇結果為${ramdonChoose(items)}`;
	}
	// send msg to user
	event.reply(reqMessage).then(function (data) {
		logMessage.log(debugMode, "INFO", `已傳送: \"${reqMessage.replace(/\r\n|\n/g,"\\n")}\",至客戶端`);
	}).catch(function (error) {
		logMessage.log(debugMode, "ERROR", error);
	});
}
// get ramdon result
function ramdonChoose(items){
	return items[getRandomInt(items.length)];
}

// get 0 < x < max ramdon number
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

// get weather info
function getWeatherInfo(event, userName, location, area){
	let twFileName = `${userName}_${Timestamp}_`;
	tw.get(
		config.twKey,
		{
			loc: tw.DataEnum.Loc[constLoc[location]],
			freq: tw.DataEnum.Freq.H72,
			lang: tw.DataEnum.Lang.ZH,
			output: 'data',
			prefix: twFileName,
			toJson: true
		},
		err => {
			if (err) {
				logMessage.log(debugMode, "ERROR", err);
			}else{
				let locDescription = [];
				let fileList = fs.readdirSync("./data/");
				fileList.filter((file)=>file.indexOf(twFileName) !== -1);
				let twJsonFileName = "";
				fileList.map((file) => {
					if(file.indexOf(".json") !== -1) twJsonFileName = file;
				});
				logMessage.log(debugMode, "DEBUG", `tw file name: ${twJsonFileName}`);
				let twData = JSON.parse(fs.readFileSync(`./data/${twJsonFileName}`));
				twData.cwbopendata.dataset[0].locations[0].location.map((element)=>{
					locDescription.push({
						locationName: element.locationName[0],
						weatherDescription: element.weatherElement[10].time[0].elementValue[0].value[0]
					})
				});

				fs.unlinkSync(`./data/${fileList[0]}`);
				fs.unlinkSync(`./data/${fileList[1]}`);

				logMessage.log(debugMode, "DEBUG", JSON.stringify(locDescription));
				
				locDescription.filter(element => element === area);
				let weatherDescription = "";
				if(locDescription.length === 0){
					weatherDescription = "無法查詢到你指定地點的天氣資訊";
				}else{
					weatherDescription = `Hi ${userName},\n${location}${area} 當前天氣狀況如下: ${locDescription[0].weatherDescription}`;
				}

				event.reply(weatherDescription).then(function (data) {
					logMessage.log(debugMode, "INFO", `已傳送: \"${weatherDescription.replace(/\r\n|\n/g,"\\n")}\",至客戶端`);
				}).catch(function (error) {
					logMessage.log(debugMode, "ERROR", error);
				});
				
				
			}
		}
	);
	
	
}