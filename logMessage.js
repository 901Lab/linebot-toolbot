var fs = require('fs');
var moment = require('moment');
var Timestamp = Date.now();
const logPath = "./log";
const logFileName = `LS_${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}.log`;
// log message process
function log(debugMode, logType, logMessage){
	switch(logType){
		case "ERROR":
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] ERROR: ${logMessage}\n`);
			console.log("\x1b[31m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] ERROR: ${logMessage}`);
			break;
		case "INFO":
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] INFO: ${logMessage}\n`);
			console.log("\x1b[32m",	`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] INFO: ${logMessage}`);
			break;
		case "DEBUG":
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] DEBUG: ${logMessage}\n`);
			if(debugMode === 1) console.log("\x1b[34m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] DEBUG: ${logMessage}`);
			break;
		default:
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] Error: The log type does not existed\n`);
			console.log("\x1b[31m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] Error: The log type does not existed`);
	}
		
}
// write log msg into log file
function writeLogFile(msg){	
	if(!fs.existsSync(logPath))
		fs.mkdirSync(logPath);
	fs.appendFile(logPath+"/"+logFileName, msg, function (err) {
		if (err) console.log(err);
	});
}

module.exports = {
    log
};