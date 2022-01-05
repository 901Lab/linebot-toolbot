var fs = require('fs');
//read message file
let messageJson = JSON.parse(fs.readFileSync('./message.json'));

function buttonHandle(title, description, actions){
	var buttonTemp = messageJson.button;
	buttonTemp.template.title = title;
	buttonTemp.template.text = description;
	buttonTemp.template.actions = actions;
	return buttonTemp;
}

module.exports = {
    buttonHandle
};