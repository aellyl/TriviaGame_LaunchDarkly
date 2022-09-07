//$(document).ready(function() {
//Set up LaunchDarkly variables
const clientId="your-client-key";
const flagKey="shortLongGame";
const user = {
	'key':'12345',
	'name': 'Tester',
	'email': 'test1@example.com',
  	privateAttributeNames: ['email'],
	'custom': {
		'age': 18	
		}
};

const user2 = {
	'key':'678910',
	'name': 'Tester2',
	'custom': {
		'age': 12	
		}
};

const ldclient = LDClient.initialize(clientId, user, {
  privateAttributeNames: ['email']
});



// Trivia Game variables
var trivaQTime;
var qCnt=0; //question count
var showNextQ;
var numQs=-1;
//array of trivia questions
var questions= [
{question: "What is world's most popular color?",
 answer: "blue",
 options: ["Red","Blue","Yellow","Green"]
},

{question: "What is the first color that a baby can see?",
 answer: "red",
 options: ["Red","Blue","Yellow","Green"]
},

{question: "What is the best color to suppress anxiety and anger?",
 answer: "pink",
 options: ["Baby Blue","Yellow","Pink","Teal"]
},

{question: "Which color for the body of a car will reduce the chance of being in a car accident?",
 answer: "white",
 options: ["Black","Navy Blue","Red","White"]
},

{question: "Which color combination will most likely make you hungry?",
 answer: "yellow + red",
 options: ["White + Yellow","Green + Red","Blue + Yellow","Yellow + Red"]
},

{question: "What color will be soothing for chickens?",
 answer: "red",
 options: ["Yellow","Red","Black","Brown"]
},

{question: "Which color will attract mosquitoes the most?",
 answer: "blue",
 options: ["White","Green","Blue","Black"]
},

{question: "which color will most likely to cause nauseating feeling?",
 answer: "yellow",
 options: ["Black","Purple","Red","Yellow"]
},

{question: "What is the true color of the Sun?",
 answer: "white",
 options: ["Red","White","Yellow","Orange"]
},

{question: "Which color is to believe to increase concentration?",
 answer: "green",
 options: ["White","Brown","Green","Blue"]
},

{question: "What are primary colors?",
 answer: "red, yellow, blue",
 options: ["Purle, Orange, Green","Black, White, Brown","Teal, Mangenta, Maroon","Red, Yellow, Blue"]
},

{question: "In traditional chinese culture, which color of cloth is used in a funeral?",
 answer: "white",
 options: ["White","Black","Grey","Brown"]
},

{question: "Which color is most likely to associate with growth?",
 answer: "green",
 options: ["Blue","Green","Orange","Purple"]
},

{question: "Which color is most likely to assoicate with energy?",
 answer: "orange",
 options: ["Yellow","Red","White","Orange"]
},

{question: "There are two color systems: addtive and substractive, in which color system, you will create the color black when mixing all the colors together?",
 answer: "substractive color",
 options: ["Additive color","Substractive color"]
}
]//close question array
const currTimer=10;

var timerId;
var timerCount=currTimer; //unit 1 second
var correctCnt=0;
var incorrectCnt=0;
var qNotAnswered=0;

//User input section
//start game when start button is clicked

//use LaunchDarkly's flag
ldclient.on("ready",() => {

	var flagValue = ldclient.variation(flagKey,false);
	console.log("SDK successfully connected! The value of "+flagKey+" is " + flagValue + " for " + user.key)
	//console.log("current flageValue: " + flagValue);

	if(flagValue)
	{
		$("#startBtn").addClass("disabled");
		 duplicateSpinner()
		clickShortLongButton();
	}
	else
	{
		$("#shortG").addClass("disabled");
		$("#longG").addClass("disabled");
		 duplicateSpinner()
		clickStartButton();
	}


});


function clickStartButton(){
	$("body").on("click", "#startBtn", function(event){
	numQs=questions.length;
	startGame();
}); 

}

function clickShortLongButton(){
	$("body").on("click", "#shortG", function(event){
	numQs=2;
	startGame();
});

$("body").on("click", "#longG", function(event){
	numQs=10;
	startGame();
});

}

$("body").on("click", "#restartBtn", function(event){
	resetGame();
}); 

$("body").on("click",".ansOpt",function(e){
	var userAns=$(this).attr("data"); //get user's answer choice
	if(userAns === questions[qCnt].answer)
	{
		//display win screen
		correctCnt++;
		clearInterval(timerId);//stop timer
		winScreen(userAns);

	}
	else
	{
		//display loss screen
		incorrectCnt++;
		clearInterval(timerId);//stop timer
		wrongScreen(userAns);
	}

	//$(".spinner--right > div").removeClass('js-active')

});



//Game function section
function displayQuestion(){

	
	
	$("#triviaQs").html("<div class=\"spinner__face js-active\" data-bg=\"#5b4b62\"><div class=\"content\" data-type=\"question\"><div class=\"content__left\" id=\"triviaQsLeft\">");
	$("#triviaQsLeft").html("<h2>"+(qCnt+1) +". " + questions[qCnt].question+"</h2>");
	$("#triviaQsLeft").append("<br><p class=\"lead\">Time Remaining: " + "<span id=timer>" + timerCount +" seconds</span></p>");

	$(".content").append("<div class=\"content__right\" id=\"triviaQRight\">");
	$("#triviaQRight").html("<div class=\"content__main\">");
	
	//display answer options
	for(var i=0;i< questions[qCnt].options.length;i++)
	{
		var currOption=questions[qCnt].options[i];
		var ansOpt=$("<button>");
		ansOpt.addClass("ansOpt btn btn-dark btn-lg btn-block");
		ansOpt.attr("data",currOption.toLowerCase());
		ansOpt.html(currOption);
		$("#triviaQRight").append(ansOpt);
	}
	$("#triviaQRight").append("<h3 class=\"content__index\">0" + (qCnt+1) + "</h3>");

	//display buttons on the right side of the screen
	RightContent = $('.spinner').html();
	$(".spinner--right").html(RightContent);

	paintFaces();
   	

}





function nextQuestion(){
	
	if(qCnt < numQs)
	{
		timer(); //start the quiz timer
		displayQuestion();
			
	}
	else
	{
		endGame();
	}


}

var timeoutGreenting=["Time is out!","Out of Time.","Think fast, next time.","Time's up!"]
var timeoutGifs=["notfair.gif","outoftime.gif","timesup.gif","timesup2.gif"];

function timeoutScreen(){
	

	//display the correct answer
	var randIndex= Math.floor(Math.random() * timeoutGreenting.length);

	$("#triviaQs").html("<div class=\"spinner__face js-active\" data-bg=\"#35512e\"><div class=\"content\" data-type=\"question\"><div class=\"content__left\" id=\"triviaQsLeft\">");


	$("#triviaQsLeft").html("<h2>"+timeoutGreenting[randIndex]+"</h2>");
	$("#triviaQsLeft").append("<p class=\"lead\">You didn't choose an answer.</p><p>The time is up.</p><p>The correct answer is:" + questions[qCnt].answer+".</p>");
	// randIndex= Math.floor(Math.random() * timeoutGifs.length);

	$(".content").append("<div class=\"content__right\" id=\"triviaQRight\">");
	$("#triviaQRight").html("<div class=\"content__main\">");
	$("#triviaQRight").append("<img src=./assets/images/" + timeoutGifs[randIndex]+">");

	//display buttons on the right side of the screen
	RightContent = $('.spinner').html();
	$(".spinner--right").html(RightContent);

	qNotAnswered++;
	//prep for next question
	prepForNextQuestion();
}

function prepForNextQuestion(){
	//prep for next question
	setTimeout(nextQuestion,5000);// wait 5 second to diplay next question
	qCnt++;//go to next question counter
	timerCount=currTimer;//reset the timer
	paintFaces();
}

var winGreenting=["Yes!","Correct!!","You are right.","Hooray"]
var winGifs=["brilliant.gif","right.gif","pokemonHooray.gif","minionHooray.gif"];

function winScreen(userAnswer)
{
	var randIndex= Math.floor(Math.random() * winGreenting.length);

	$("#triviaQs").html("<div class=\"spinner__face js-active\" data-bg=\"#302e51\"><div class=\"content\" data-type=\"question\"><div class=\"content__left\" id=\"triviaQsLeft\">");
	
	$("#triviaQsLeft").html("<h2>"+winGreenting[randIndex]+"</h2>");
	$("#triviaQsLeft").append("<p class=\"lead\">Your answer is " + userAnswer+ " and it is correct.</p>");
	// randIndex= Math.floor(Math.random() * winGifs.length);
	$(".content").append("<div class=\"content__right\" id=\"triviaQRight\">");
	$("#triviaQRight").html("<div class=\"content__main\">");
	
	$("#triviaQRight").append("<img src=./assets/images/" + winGifs[randIndex]+">");

	//display buttons on the right side of the screen
	RightContent = $('.spinner').html();
	$(".spinner--right").html(RightContent);
	//prep for next question
	prepForNextQuestion();
}
 var wrongGreeting=["Wrong!!","Nope","Incorrect","Try Again"]
 var wrongGifs=["catwrong.gif","nono.gif","wrong.gif","think.gif"];
function wrongScreen(userAnswer)
{
	var randIndex= Math.floor(Math.random() * wrongGreeting.length);
	$("#triviaQs").html("<div class=\"spinner__face js-active\" data-bg=\"#543939\"><div class=\"content\" data-type=\"question\"><div class=\"content__left\" id=\"triviaQsLeft\">");
	
	$("#triviaQsLeft").html("<h2>"+wrongGreeting[randIndex]+"</h2>");
	$("#triviaQsLeft").append("<p class=\"lead\">Your picked: "+userAnswer + "</p><span>  </span><p>The correct answer is: " + questions[qCnt].answer+"</p>");
	// randIndex= Math.floor(Math.random() * wrongGifs.length);

	$(".content").append("<div class=\"content__right\" id=\"triviaQRight\">");
	$("#triviaQRight").html("<div class=\"content__main\">");
	$("#triviaQRight").append("<img src=./assets/images/" + wrongGifs[randIndex]+">");

	//display buttons on the right side of the screen
	RightContent = $('.spinner').html();
	$(".spinner--right").html(RightContent);


	//prep for next question
	prepForNextQuestion();
}

function startGame() {

  // showNextQ=setInterval(nextQuestion, 30000);

  nextQuestion();
  // $("#triviaQs").html("<img src=./assets/images/loading.gif height=85%>")

}

function endGame()
{

	$("#triviaQs").html("<div class=\"spinner__face js-active\" data-bg=\"#27323c\"><div class=\"content\" data-type=\"question\"><div class=\"content__left\" id=\"triviaQsLeft\">");

	$("#triviaQsLeft").html("<h2>That's all! Here is how you did</h2><ul class=\"list-group\"><li class=\"list-group-item\">Corret Answers<span class=\"badge\">"+correctCnt+"</span> </li><li class=\"list-group-item\">Wrong Answers<span class=\"badge\">"+incorrectCnt+"</span> </li><li class=\"list-group-item\">Missed Questions<span class=\"badge\">"+qNotAnswered+"</span></li></ul>");
	//add restart button
	//$("#triviaQsLeft").append("<button type=\"button\" class=\"btn btn-dark btn-lg btn-block\" id=\"restartBtn\">Restart</button>");


	//add done image
	if(numQs=qCnt)
	{
	$(".content").append("<div class=\"content__right\" id=\"triviaQRight\">");
	$("#triviaQRight").html("<div class=\"content__main\">");
	$("#triviaQRight").append("<img src=./assets/images/done.gif>");
	//display buttons on the right side of the screen
	RightContent = $('.spinner').html();
	$(".spinner--right").html(RightContent);
	}
	paintFaces();
}
	
function randomOrder() {
 return (Math.round(Math.random())-0.5);
};

function restartPage()
{
	$(".carousel__stage").html("<div class=\"spinner spinner--left\" id=\"triviaQs\"><div class=\"spinner__face js-active\" data-bg=\"#27323c\"><div class=\"content\" data-type=\"iceland\"><div class=\"content__left\" id=\"triviaQsLeft\"><h1>Color Trivia Game<br>\<span\>Let's play again</span></h1></div><div class=\"content__right\" id=\"triviaQRight\"><div class=\"content__main\"></div><h3 class=\"content__index\">00</h3></div></div></div></div><div class=\"spinner spinner--right\" id=\"triviaQs\"><div class=\"spinner__face js-active\" data-bg=\"#27323c\"><div class=\"content\" data-type=\"iceland\"><div class=\"content__left\" id=\"triviaQsLeft\"></div><div class=\"content__right\" id=\"triviaQRight\"><div class=\"content__main\"><button type=\"button\" class=\"btn btn-dark btn-lg\" id=\"startBtn\">Start</button><button type=\"button\" class=\"btn btn-dark btn-lg\" id=\"shortG\">short game</button><button type=\"button\" class=\"btn btn-dark btn-lg\" id=\"longG\">long game</button></div><h3 class=\"content__index\">00</h3></div></div></div></div></div>"
		);

	paintFaces();
}

function resetGame()
{
	qCnt=0;
	correctCnt=0;
	incorrectCnt=0;
	qNotAnswered=0;
	timerCount=currTimer; //timer counter number
	questions.sort(randomOrder);//reduce the chance to get the same character

	//startGame();
	
	restartPage();

}



function timer(){
	timerId = setInterval(timerCounter, 1000);
	function timerCounter() {
		if (timerCount === 0) {
			clearInterval(timerId);
			//display lose screen due to time out
			timeoutScreen();
		}
		if (timerCount > 0) {
			timerCount--;
		}
		$("#timer").html(timerCount+" seconds");
	}
}


//});//close document ready