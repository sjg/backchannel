var initSchedule = function loadSchedule(){
	$.getJSON('./schedule.json', function(data) {

		//Get Current event in schedule
		var now = new Date();
		var counter = 0; 

		populateSchedule(data);
		$(".panel").removeClass("panel-primary");

		if(new Date(data.conferenceDate) > now){
			$(".currentSession").html("The conference starts on " + new XDate(data.conferenceDate).toString("dd/MM/yy") + " at 9:00am.");
			$(".mainDisplay").html("<span class='glyphicon glyphicon-home'></span>");
		}else if(today(data.conferenceDate)){	
			$(".nowNext h1").show();
			var gotSession = false; 

			var setSession = function(sessionObject){
				$(".currentSession").html(sessionObject.title);
					$(".presenter").html(sessionObject.presenter);
					$(".time").html(new XDate(sessionObject.startTime).toString("h:mm") + " - " + new XDate(sessionObject.endTime).toString("h:mm"));

					if(sessionObject.type == "session"){
						$(".mainDisplay").html("<iframe width='100%' height='492px' src='http://www.youtube.com/v/"+sessionObject.youtube_link+"?autoplay=1&vq=hd720' frameborder='0' allowfullscreen></iframe>");
					}else if(sessionObject.type == "break"){
						$(".mainDisplay").html("<a class='glyphicons no-js coffe_cup'><i></i></a><a class='glyphicons no-js cake'><i></i></a><br/>" + sessionObject.title + " Break");
						$(".presenter").html("Break");
					}

					$('#' + (new XDate(sessionObject.startTime).toString("hhmm"))).addClass("panel-primary");
			}

			$(".mainDisplay").show();
			$(".time").show();
			$(".presenter").show();
			$(".nowNext h1").show();

			$.each(data.programme, function(key, value){
				var from = new Date(value.startTime);
				var to = new Date(value.endTime);

				if(now < from && now < to){
					setSession(data.programme[counter-1]);					
					gotSession = true;

					// Set the refresh at the end of the session
					var millToRefresh = new XDate().diffMilliseconds(new XDate(data.programme[counter-1].endTime));
					var s = setTimeout(initSchedule, millToRefresh + 30 * 1000); // Give us some grace time to get ready

					return false;
				}

				counter++;
			});
			if(!gotSession){
				//We are at the last session of the day -- No refresh please!
				setSession(data.programme[counter-1]);
			}
		}else{
			$(".currentSession").html("The conference is now over.");
			$(".mainDisplay").hide();
			$(".time").hide();
			$(".presenter").hide();
			$(".nowNext h1").hide();
		}
	});
};

var panelSpacer = function panel(title, content, panelID){ 
	return("<div class='panel panel-default' id='" + panelID +"'><div class='panel-heading'><b>"+title+"</b></div><div class='panel-body'><p> " + content+ "</p></div>");
};

var tweetText = function tweetText(content, image, time){
	if(image == undefined){ 
		image = " <span style='padding: 7px; padding-top: 2px; position: absolute;''><a class='glyphicons twitter'><i></i></a></span>";
	}
	return("<div class='stbody'><div class='stimg'>" + image + "</div> <div class='sttext'>" + content + " <div class='sttime'><small>" + time + "</small></div> </div> </div>");
}

var googlePlusText = function tweetText(content, image, time){
	if(image == undefined){ 
		image = " <span style='padding: 7px; padding-top: 2px; position: absolute;''><a class='glyphicons google_plus'><i></i></a></span>";
	}
	return("<div class='stbody'><div class='stimg'>" + image + "</div> <div class='sttext'>" + content + " <div class='sttime'><small>" + time + "</small></div> </div> </div>");
}

function populateSchedule(data){
	$.each(data.programme, function(key, value){
		if(value.type !== "break"){
			$('#scheduleInfo').append(panelSpacer(value.title + "<span style='float: right;'>" +  new XDate(value.startTime).toString("h:mm") + " - " + new XDate(value.endTime).toString("h:mm") + "</span>", value.presenter, (new XDate(value.startTime).toString("hhmm"))));
		}else{
			$('#scheduleInfo').append(panelSpacer(value.title + "<span style='float: right;'>" + new XDate(value.startTime).toString("h:mm") + " - " + new XDate(value.endTime).toString("h:mm") + "</span>", "Break", (new XDate(value.startTime).toString("hhmm"))));
		}
	});
}


var startServer = function serverStart(){
	jQuery.getScript( "http://www.stevenjamesgray.com:8889/socket.io/socket.io.js", function() { 
		socket = io.connect('http://www.stevenjamesgray.com:8889');
		socket.on('refreshClients', function() {
    		initSchedule();
  		});

  		socket.on('updateConnections', function(data){
  			$(".clientsWatching").html("People watching: " + data.connections);		
  		})
	});
}

var refresh = function(){
	socket.emit("refresh");
}

function today(td){
	var d = new XDate();
	td = new XDate(td);
	return(td.toDateString() == d.toDateString());
}

$(function() {
	$(".nowNext h1").hide();
	initSchedule();
	startServer();

	//Enable Modal Schedule
	$("#schedule").click(function() {
  		$('#scheduleModal').modal('show');
  	});

  	//$("#tweetContent").html(tweetText("hey", null, "2 mins"));
  	//$("#gContent").html(googlePlusText("hey", null, "2 mins"));

});





