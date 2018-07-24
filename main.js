
// EVENT LISTENER FOR FORM SUBMISSION, includes called functions and callbacks.
$('#song-search').submit(event => {
  event.preventDefault();
  console.log('submitting user input');

  const songTitleTarget = $(event.currentTarget).find('.js-song-query');
  const songTitleQuery = songTitleTarget.val();
  const artistTarget = $(event.currentTarget).find('.js-artist-query');
  const artistQuery = artistTarget.val();

  console.log(`user is searching for ${songTitleQuery} by ${artistQuery}`);

  songTitleTarget.val("");
  artistTarget.val("");

  getLyricData(songTitleQuery, artistQuery, renderLyrics);
  getYoutubeData(songTitleQuery, artistQuery, renderResult);
  getArtistData(artistQuery, getEventData);
});

// MUSIXMATCH LYRIC API FUNCTION
function getLyricData(songTitleQuery, artistQuery, callback) {
  const settings = {
    type: 'GET',
    data: {
      apikey: 'ckw0AQMG9RJJzoePEGhYq31rHHVesMHqwUIavY94J0IiS4QMlNgsHvY3USAD3102',
    },
    url: `https://orion.apiseeds.com/api/music/lyric/${artistQuery}/${songTitleQuery}`,
    dataType: 'json',
    success: callback,
    error: function() {
			$('#lyric-results').remove();
      $('.lyrics').append(`<div id="lyric-results"><p>No results found for <br>Song Title: ${songTitleQuery} <br> Artist: ${artistQuery}</p> </div>`);
    }
  }
  $.ajax(settings);

}

function renderLyrics(data) {
  $('#lyric-results').remove();
  const results = data.result.track.text;
  var paddedResults = results.replace(/\n/g, '<br>');

  $('.lyrics').append(
    `	<p id="lyric-results">${paddedResults}</p>`);
}


// YOUTUBE API FUNCTIONS
function getYoutubeData(songTitleQuery, artistQuery, callback) {
  const settings = {
    url: 'https://www.googleapis.com/youtube/v3/search',
    data: {
      part: 'snippet',
      type: 'video',
      key: 'AIzaSyChZKVX1c1LhlqrDACPIBe9czjHrwaNESY',
      q: `${artistQuery} ${songTitleQuery}`,
    },
    dataType: 'json',
    type: 'GET',
    success: callback
  }

  $.ajax(settings);
  console.log('getting data from youtube');
}

function renderResult(data) {
  
  var thumbnailResult = data.items[1].snippet.thumbnails.medium.url;
  var youtubeURL = data.items[1].id.videoId;
  console.log(thumbnailResult);
  $('#youtube-result').empty();
  $('#youtube-result').append(
    `<a href="https://www.youtube.com/watch?v=${youtubeURL}" id="youtube-link" target="_blank">
    <img src="${data.items[1].snippet.thumbnails.medium.url}" alt="video thumbnail"></a>	
    <p>${data.items[1].snippet.title}</p>`
  )

  console.log('loading result...');
  
}

// EVENTFUL API FUNCTIONS
function getArtistData(artistQuery, callback) {
  const settings = {
    url: 'https://api.eventful.com/json/performers/search',
    data: {
      app_key: '7C4BMRmZ8LDT4C4k',
      keywords: `${artistQuery}`,
    },
    dataType: 'jsonp',
    crossDomain: true,
    type: 'GET',
    success: callback
  }
  $.ajax(settings);
  const artist = $.ajax(settings);
  console.log(artist);
}
  
function getEventData(artistData, callback) {
  
  let artistID;

  // if no performer, append no results message
  // else if performers is not an array, get artistId from object
  // else if performers IS an array,  get artistID from from first performer.

  if( artistData.performers == null){
    $('#js-concertresults').empty()
    $('#js-concertresults').append(
      `<p>There are no current events for this Artist.</p>`)
  } else if(!Array.isArray(artistData.performers.performer)){
    artistID = artistData.performers.performer.id;
  } else {
    artistID = artistData.performers.performer[0].id;
  }
  console.log(artistID);

  const settings = {
    url: 'https://api.eventful.com/json/performers/get',
    data: {
      app_key: '7C4BMRmZ8LDT4C4k',
      id: artistID,
      show_events: true,
    },
    dataType: 'jsonp',
    crossDomain: true,
    type: 'GET',
    success: renderEvents
  }
  $.ajax(settings);
}

function renderEvents(eventData) {
  console.log('here are some events');
  console.log(eventData.events);

  // IF NO EVENTS 
  if (eventData.events === null || eventData.events === undefined){
    $('#js-concertresults').empty();
    $('#js-concertresults').append(
      `<div class="container">
      <h2>Upcoming Events</h2>
      <p>No upcoming events for this artist.</p>
      </div>`
    )
  } else {
    //OTHERWISE APPEND EVENTS
    $('#js-concertresults').empty();
    $('#js-concertresults').append(
      `<div class="container">
        <h2>Upcoming Events</h2>
        <div class="box more-result">
          <p>Event: ${eventData.events.event[0].title}</p>
          <p>Location: ${eventData.events.event[0].location}</p>
          <p>Date: ${eventData.events.event[0].start_time}</p>
          <p>More Info: <a href="${eventData.events.event[0].url}" target="_blank">Event Info</a></p>
  			</div>
  
        <div class="box more-result">
          <p>Event: ${eventData.events.event[1].title}</p>
          <p>Location: ${eventData.events.event[1].location}</p>
          <p>Date: ${eventData.events.event[1].start_time}</p>
          <p>More Info: <a href="${eventData.events.event[1].url}" target="_blank">Event Info</a></p>
        </div>
  
        <div class="box more-result">
          <p>Event: ${eventData.events.event[2].title}</p>
          <p>Location: ${eventData.events.event[2].location}</p>
          <p>Date: ${eventData.events.event[2].start_time}</p>
          <p>More Info: <a href="${eventData.events.event[2].url}" target="_blank">Event Info</a></p>
        </div>
        </div>`   
    )
  }
}


















// function renderMoreResults(data) {
//   console.log('loading more results...');
//   const moreResults1 = data.items[1].id.videoId;
//   const moreResults2 = data.items[2].id.videoId;
//   const moreResults3 = data.items[3].id.videoId;
//   console.log(`moreResults1 videoID is ${moreResults1}`);
//   console.log(`moreResults2 videoID is ${moreResults2}`);
//   console.log(`moreResults3 videoID is ${moreResults3}`);

// 	$('#js-moreresults-target').empty();
//   $('#js-moreresults-target').append(

//     `<div class="container">
// 				<h2>Didn't Find The Correct Music Video?</h2>
// 				<p>Choose another option by clicking the video thumbnail below</p>

// 			<div class="box more-result">
// 				<a href="#" videoid="${moreResults1}" id="moreresult1" onclick="javascript:moreResultVideo1(event)">
// 				<img src="${data.items[1].snippet.thumbnails.medium.url}" alt="video thumbnail"></a>	
// 				<p>${data.items[1].snippet.title}</p>
// // 			</div>

// 			<div class="box more-result">
// 			<a href="#" videoid="${moreResults2}"  id="moreresult2" onclick="javascript:moreResultVideo2(event)">
// 				<img src="${data.items[2].snippet.thumbnails.medium.url}" alt="video thumbnail"></a>
// 				<p>${data.items[2].snippet.title}</p>
// 			</div>

// 			<div class="box more-result">
// 			<a href="#" videoid="${moreResults3}" id="moreresult3" onclick="javascript:moreResultVideo3(event)">
// 				<img src="${data.items[3].snippet.thumbnails.medium.url}" alt="video thumbnail"></a>
// 				<p>${data.items[3].snippet.title}</p>
// 			</div>
// 			</div>`
//   );
// }
