// EVENT LISTENER FOR FORM SUBMISSION, includes called functions and callbacks.
$('#song-search').submit(event => {
  event.preventDefault();
  console.log('submitting user input');

  // log search inputs
  const songTitleTarget = $(event.currentTarget).find('.js-song-query');
  const songTitleQuery = songTitleTarget.val();
  const artistTarget = $(event.currentTarget).find('.js-artist-query');
  const artistQuery = artistTarget.val();

  console.log(`user is searching for ${songTitleQuery} by ${artistQuery}`);

  songTitleTarget.val("");
  artistTarget.val("");

  $('#search-form').addClass('reveal')
  
  getLyricData(songTitleQuery, artistQuery, renderLyrics);
  getYoutubeData(songTitleQuery, artistQuery, renderResult);
  getArtistData(artistQuery, getEventData);

});

// MUSIXMATCH LYRIC API FUNCTION
function getLyricData(songTitleQuery, artistQuery, callback) {
  const settings = {
    type: 'GET',
    contentType: "application/json; charset=utf-8",
    data: {
      apikey: '2933bfd90e49ee046e73a3d33c4e15b3',
      q_track: `${artistQuery}`,
      q_artist: `${songTitleQuery}`,
    },
    url: `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get`,
    dataType: 'jsonp',
    success: callback,
    error: function() {
			$('.lyrics').empty();
      $('.lyrics').append(`
      <h3>No Lyrics Found</h3>
      <div id="lyric-results"><p>No results found for <br>Song Title: ${songTitleQuery} <br> Artist: ${artistQuery}</p> </div>`);
    }
  }
  $.ajax(settings);

}

function renderLyrics(data) {
  $('.lyrics').empty();
  console.log(data.message.body)
  if( data.message.body.lyrics !== undefined) {
    var paddedResults = data.message.body.lyrics.lyrics_body.replace(/\n/g, '<br>');
    $('.lyrics').append(
      `<h3>Song Lyrics</h3>	
      <p id="lyric-results">${paddedResults}</p>`);
  } else {
    $('.lyrics').append(`
    <h3>No Lyrics Found</h3>
    <div id="lyric-results"><p>No results found</p> </div>`);
  }
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
  
  var thumbnailResult = data.items[1].snippet.thumbnails.medium.url
  ;
  var youtubeURL = data.items[1].id.videoId;
  console.log(thumbnailResult);
  $('#youtube-result').empty();
  $('#youtube-result').append(
    ` <h3>Song Thumbnail</h3>
    <p> ${data.items[1].snippet.title}</p>
    <a href="https://www.youtube.com/watch?v=${youtubeURL}" id="youtube-link" target="_blank">
    <img src="${data.items[1].snippet.thumbnails.medium.url}" alt="video thumbnail"></a>	
    <p>Click the photo to view the music video.</p>
    `
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
}
  
function getEventData(artistData, callback) {
  let artistID;
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
    $('#js-concertresults').empty();
    $('#js-concertresults').append(`<h2>Upcoming Events</h2>`);
    if (eventData.events.event.length < 3){
      for( let i = 0; i < eventData.events.event.length; i++){
        $('#js-concertresults').append(
        `
        <div class="col-3">
          <p><span>Event:</span> <a href="${eventData.events.event[i].url}" target="_blank">${eventData.events.event[i].title}</a></p>
          <p><span>Location:</span> ${eventData.events.event[i].location}</p>
          <p><span>Date:</span> ${eventData.events.event[i].start_time}</p>
        </div>
      `);       
      }
    } else {
      for ( let i = 0; i < 3; i++){
    $('#js-concertresults').append(
      `
        <div class="col-3">
          <p><span>Event:</span> <a href="${eventData.events.event[i].url}" target="_blank">${eventData.events.event[i].title} <i class="fas fa-arrow-alt-circle-left"></i></a></p>
          <p><i class="fas fa-compass"></i> <span>Location:</span> ${eventData.events.event[i].location}</p>
          <p><i class="fas fa-calendar-alt"></i> <span>Date:</span> ${eventData.events.event[i].start_time}</p>
        </div>
      `);
    }
  }
}}