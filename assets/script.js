let isNew = false;

// when the city search button is clicked
// appends the city to the city container div and displays weather info
$("#searchBtn").on("click", () =>{
    let cityVal = $("input").val();
    // sets up the whoYouGonnaCall function to add a button to the cityButtonList
    isNew = true;
    // displays weather
    whoYouGonnaCall(cityVal);
    // clears the input text
    $("input").val("");
});


// when a city button is clicked 
// it populates the forecasts
$("#city-list").on("click", (event) =>{
    // get the event target and the city name from the target
    if(event.target.matches("button")){
        let cityVal = event.target.textContent;
        // tells whoYouGonnaCall not to make a new button
        isNew = false;
        whoYouGonnaCall(cityVal);
        
    }
});

// adds buttons to the cityList div
function cityListPopulator(cityVal){
    let alreadyMade = false;
    // saves the last city to be added to the city-list div in local storage
    localStorage.setItem("lastCity", cityVal)
    $(".cityListBtn").each(function(){

        if(cityVal === $(this).text()){
            console.log("inside")
            alreadyMade = true
            return alreadyMade;
        }
    });
    if(!alreadyMade){

        // creates and appends
        let cityEL = $("<button>");
        cityEL.text(cityVal);
        cityEL.attr("class", "btn btn-block cityListBtn");
        cityEL.attr("data-city", cityVal);
        $("#city-list").prepend(cityEL);
    }
    

}

function whoYouGonnaCall (cityVal){
    // send an ajaxs call with the city name for the #btnForecast
    // 1 get api key
    let apiKey = "46c83042b2cdf276d685079cb38dbf65";
    // 2 get query url
    let apiUrl = "http://api.openweathermap.org/data/2.5/weather?q="+cityVal+"&units=imperial&appid="+apiKey;
    // 3 send call and then function
    $.ajax({
        url: apiUrl,
        method: "GET"
    })
    .then((response) =>{
        let cityName = response.name;

        // if the call from the search button then make a new button in the city list
        if(isNew){
            cityListPopulator(cityName);
        };

        // delete old boxes 
        $(".fiveDayForecast").remove();

        // begin populating button forecast div
        $("#cityNameDate").text((cityName)+" "+moment().format('L'));
        $("#cityNameDate").append($("<img>").attr("src",  "http://openweathermap.org/img/wn/"+ response.weather[0].icon+"@2x.png" ));
        $("#temp").html("Temperature: "+(response.main.temp)+ '9&#176'+"F");
        $("#humidity").text(response.main.humidity + "%");
        $("#windSpeed").text(response.wind.speed + " MPH");

        // looks like I need to make another call for uvi
        let lon = response.coord.lon;
        let lat = response.coord.lat;
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey,
            method: "GET"
        }).then((response) =>{
            let uvi = response.value;
            $("#uv").text("UV Index: ");
            // colors the uvi based on its value
            if(uvi < 3){
                $("#uv").append(
                    $("<div>").attr("class", "low").text(uvi)
                );
            }
            else if(uvi < 6){
                $("#uv").append(
                    $("<div>").attr("class", "moderate").text(uvi)
                );
            }
            else if(uvi < 8){
                $("#uv").append(
                    $("<div>").attr("class", "high").text(uvi)
                );
            }
            else{
                $("#uv").append(
                    $("<div>").attr("class", "veryHigh").text(uvi)
                );
            };
        });

        // get a 5 day forecast from a today and the next 7 days forecast 
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&units=imperial&exclude=current,minutely,hourly,alerts&appid="+apiKey,
            method: "GET"
        }).then((response) =>{
            let dailyForecastArr = response.daily;
            // loops through the next day to the next five days
            for(let i = 1; i < 6; i++){
                // creates a new div for each day 
                let forecastDiv = $("<div>").attr("class", "fiveDayForecast");
                let date = String(moment().add(i, 'day').format('L'));
                
                // adds the weather info to the div
                forecastDiv.prepend($("<p>").text(date));
                forecastDiv.append($("<img>").attr("src", "http://openweathermap.org/img/wn/"+dailyForecastArr[i].weather[0].icon+"@2x.png"));
                forecastDiv.append($("<p>").html("Temp: "+dailyForecastArr[i].temp.day+'9&#176'+"F"));
                forecastDiv.append($("<p>").text("Humidity: "+dailyForecastArr[i].humidity+"%"));
                $("#fiveDay").append(forecastDiv);

            };
        });
    // this will run if there is an error that occurs when calling the info
    }).catch(() => {
        alert("Not a valid city, Please check the spelling and try again.");
    });
};

// when the page loads populate with data from the last searched city
whoYouGonnaCall(localStorage.getItem("lastCity"));
cityListPopulator(localStorage.getItem("lastCity"));

// to do list: 
// update the css and improve appearance
// round the degrees to 2 decimals