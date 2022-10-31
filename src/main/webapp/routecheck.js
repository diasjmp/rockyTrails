var map;
var directionsDisplay;
var directionsService;

var routesMarkers = [];
var infowindow;

var selectedDoc;

var points = [];
var previousRoutes = [];
var pRoutesNumber = -1;
var save = true;

var drawing = false;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 38.659784, lng: -9.202765 },
    zoom: 12,
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {

          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {

          }
        ]
      }
    ]

  });

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({
    //suppressMarkers: true,
    //draggable: true,
    map: map,
  });

  addInitialPoints();

  document.getElementById('back').onclick = function (event) {
    if (drawing) {
      previousRoute();
    } else {
      for (var i = 0; i < routesMarkers.length; i++) {
        routesMarkers[i].setMap(map);
      }
      directionsDisplay.set('directions', null);
    }
  }

  document.getElementById('createMap').onclick = function (event) {
    createMapMode();
  }

}

function centerOnMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}

function resetMap() {
	$('#comments').removeClass('visible-cmt-box');
	$('#comments-box').removeClass('visible-cmt-box');
	  $('#comments-list').innerHTML = '';
  initMap();
}
function constructComment(doc) {
    
  var author = doc.data().author;
  var fullauthor = db.collection('users').doc(author);
  var fullauthorname;

  fullauthor.get().then(function(doc2) {
    
    fullauthorname = doc2.data().name + " " + doc2.data().surname + ":";

    console.log(fullauthorname);

    console.log(doc.data().content);
 

  if ( !$('#comments-box').hasClass('visible-cmt-box')) {
    $('#comments-box').addClass('visible-cmt-box');
  }
     
      let li = document.createElement('li');
      let name = document.createElement('span');
      let comment = document.createElement('span');


      li.setAttribute('data-id', doc2.id);
      name.textContent = fullauthorname;
      comment.textContent = doc.data().content;
      
      li.appendChild(name);
      li.appendChild(comment);

      $('#comments-list').append(li);

}).catch(function(error) {
    console.log("Error getting document:", error);
});

}

function showComments(doc2) {
  $('#comments').removeClass('visible-cmt-box');
  $('#comments-list').innerHTML = '';

  db.collection('routes').doc(doc2).collection('comments').get().then((snapshot) => {
      snapshot.docs.forEach( doc => {
          constructComment(doc);
      })
  })
}

function editRoute(doc2){
  $('#admin-edits').addClass('admin-edits-activated');
  $('#finishEdit').addClass('admin-edits-activated');

  var changed = false;
   var x =db.collection("routes").doc(doc2);



    $('#finishEdit').click(function() {
      var newname = $('#rname').val();
      var newdesc = $('#rdescription').val();
      var newdifficulty = $('#rdifficulty').val();
      
      if(newname.length != 0) {
        changed = true;
        x.update({
        name: newname
        }).then(() => {
          console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
      }
             
      if(newdesc.length != 0) {
        changed = true;
        x.update({
        description: newdescription
        }).then(() => {
        console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
      }

      db.collection("routes").doc(doc2).onSnapshot(function (document) {
        
        console.log(newdifficulty != document.difficulty);
        console.log(newdifficulty);
        console.log(document.get('difficulty'));
        console.log(changed);
        if(newdifficulty != document.get('difficulty')) {
          changed = true;
          x.update({
          difficulty: newdifficulty
        }).then(() => {
          console.log("Document successfully updated!");
          }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
        }
      })      

      if (!changed) {
        M.toast({html: 'Precisa de introduzir dados novos para atualizar a rota'});
      } else {
        $('#admin-edits').removeClass('admin-edits-activated');
        $('#finishEdit').removeClass('admin-edits-activated');
        
        M.toast({html: 'Rota atualizada com sucesso'});
        resetMap();
        
      }
           
    })

}

// var newname = $('.rname').val();
//         var newdesc = $('.rdescription').val();
//         var newdifficulty = $('#cmt-box').val();
    
    
//             // //"fechar" drawing mode
//             // points = [];
//             // previousRoutes = [];
//             // pRoutesNumber = -1;
//             // directionsDisplay.set('directions', null);
//             // directionsDisplay.setOptions({draggable: false});
//             // drawing = false;
    
//             if(newname.length != 0) {
//               document.update({
//                 name: newname
//             }).then(() => {
//                 console.log("Document successfully updated!");
//             }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
//             }
    
//             if(newdesc.length != 0) {
//               document.update({
//                 description: newdescription
//             }).then(() => {
//                 console.log("Document successfully updated!");
//             }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
//             }
    
//             if(Number(newdifficulty) != doc2.get("difficulty")) {
//               document.update({
//                 difficulty: newdifficulty
//             }).then(() => {
//                 console.log("Document successfully updated!");
//             }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
//             }
    
//             M.toast({html: 'Rota atualizada com sucesso'});
//             $('#input-fields').removeClass('input-fields-activated');
//           }

// function editRoute(doc2) {

// $('#admin-edits').addClass('admin-edits-activated');

// var x;

//   document.getElementById('editRoute').onclick = function() {

//         var waypts = [];

//         db.collection("routes").doc(doc2).onSnapshot(function (document) { 
            
//           // var j = document.get("points");

//           // var waypts = new Array();

//           // var treatedpoints = new Array(j.length);

//           // for (var i = 0; i < routesMarkers.length; i++) {
//           //   routesMarkers[i].setMap(null);
//           // }

//           // for (i = 0; i < j.length; i++) {
//           //   treatedpoints[i] = { lat: j[i].latitude, lng: j[i].longitude }
//           // }

//           // for(var i = 1; i < j.length -1; i++){
//           //   waypts.push({
//           //       location: treatedpoints[i],
//           //       stopover: true
//           //   });      
//           // }

//           // map.setCenter(treatedpoints[0]);
//           // map.setZoom(18);

//           // directionsService.route({
//           //   origin: treatedpoints[0],
//           //   destination: treatedpoints[i],
//           //   waypoints: waypts,
//           //   travelMode: 'WALKING'
//           // }, function(response, status) {
//           //   if (status === 'OK') {
//           //     directionsDisplay.setDirections(response);
//           //   } else {
//           //     alert('Could not display directions due to: ' + status);
//           //   }
//           // });
//           // directionsDisplay.setOptions({draggable: true});

//           // directionsDisplay.addListener('directions_changed', function() {
//           //   if(save){
//           //     saveRoute();
//           //   }

            
//           //   console.log(x);
//           // });
//           // directionsDisplay.set('directions', null);
         

//           // var geopoints = new Array();

//           // for(f = 0; f<treatedpoints.length ; f++) {
//           //   var a = new firebase.firestore.GeoPoint(Number(treatedpoints[f].lat), Number(treatedpoints[f].lng));
//           //   geopoints.push(a);
//           // }
          
//         }

//       $('#finishEdit').click(function() {
//         alert('got in here');
        
//       })
        
       
//     })
  

// }

function addInitialPoints() {
  routesMarkers = [];

  //TODO - (resolver) tá a ir buscar todos os dados, incluindo as direções que não são precissas
  //getting data from firestore
  db.collection("routes").get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
      var marker = new google.maps.Marker({
        position: { lat: doc.data().lat, lng: doc.data().lng },
        map: map
      });

      var o = doc.id;

      var routepoints = doc.data().waypts;

      var contentString = '<div id="content">' +
        '<h4 id="title">' + doc.data().name + '</h4>' +
        '<p>Distância: ' + doc.data().meters + '</p>' +
        '<p>Dificuldade: ' + doc.data().difficulty + '</p>' +
        '<p>Descrição: ' + doc.data().description + '</p>' +
        '<button type="button" onclick="printRoute(\'' + o + '\')">See Route</button> ' +
        '<button type="button" id="addComm" onclick="addComment(\'' + o + '\')">Add Comment</button> ' +
        '<button type="button" id="showComm" onclick="showComments(\'' + o + '\')">Show Comment</button> ' +
        '<button type="button" id="editRoute" onclick="editRoute(\'' + o + '\')">Edit Route</button> ';


  
        

      marker.addListener('click', function () {
        if (infowindow) {
          infowindow.close();
        }
        infowindow = new google.maps.InfoWindow({ content: contentString });
        infowindow.open(map, marker);

        auth.onAuthStateChanged(function(user) {
          if (user) {
        
              var current = user.uid;
              var loggeduser = db.collection('users').doc(current);
              console.log(loggeduser);
        
              loggeduser.get().then(function(doc2) {
          
                var role = doc2.data().role;
     
                console.log(role);
     
                if(role != "moderator" || role === void(0)) {
                  
                 document.getElementById('editRoute').setAttribute('display', 'none');
                 $('#editRoute').attr('display', 'none');
                 $('#editRoute').addClass('admin-not-logged-in');
                 console.log('here');
                   
                }
           
           }).catch(function(error) {
               console.log("Error getting document:", error);
           });
              
        
          } else {
            document.getElementById('editRoute').setAttribute('display', 'none');
            $('#editRoute').attr('display', 'none');
            $('#editRoute').addClass('admin-not-logged-in');
            console.log('here');
            return -1;
          }
        });
      });

      routesMarkers.push(marker);
    })
  })

  

}

// trigger comment box display
function addComment(doc) {

  selectedDoc = doc;
  $('#comments-box').removeClass('visible-cmt-box');
  $('#comments').addClass('visible-cmt-box');


}

// Add comment to doc 
function processComment() {
  console.log(selectedDoc);

  var commvalue = $('#cmt-box').val();

  var commentsRef = db.collection('routes').doc(selectedDoc).collection('comments');
  console.log(commentsRef);

  if (auth.currentUser.uid != null) {
    commentsRef.add({
      author: auth.currentUser.uid,
      content: commvalue,
      postDate: new Date()
    });

    M.toast({ html: 'Comentário adicionado com sucesso' });
    $('#cmt-box').val('');
    selectedDoc = null;
  } else {
    M.toast({ html: 'Deve iniciar sessão para adicionar um comentário' });
  }
}

function addIncidents(docID) {
  db.collection('routes').doc(docID).collection('incidents').get().then((snapshot) => {
    snapshot.docs.forEach( doc => {
     var treatedpoint = { lat: Number(doc.data().lat), lng: Number(doc.data().lng) }
     var description = doc.data().description;
     console.log(treatedpoint);

     var marker = new google.maps.Marker({
      position: treatedpoint,
      title: description,
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    });
    routesMarkers.push(marker);
    })
})
  
}

function printRoute(doc) {

  db.collection("routes").doc(doc).onSnapshot(function (document) {
    var j = document.get("points");
    var k = document.get("waypoints");
    var name = document.data().name;
    var initialpos = { lat: document.data().lat, lng: document.data().lng }
    var endingpos = { lat: j[j.length - 1].latitude, lng: j[j.length - 1].longitude }
    console.log(j[0].latitude);

    var treatedpoints = new Array(j.length);
    var treatedwaypoints = new Array(k.length);

    for (var i = 0; i < routesMarkers.length; i++) {
      routesMarkers[i].setMap(null);
    }
    directionsDisplay.set('directions', null);

    for (i = 0; i < j.length; i++) {
      treatedpoints[i] = { lat: j[i].latitude, lng: j[i].longitude }
    }

    for (i = 0; i < k.length; i++) {
      treatedwaypoints[i] = { lat: k[i].latitude, lng: k[i].longitude }
    }

    var marker = new google.maps.Marker({
      position: treatedpoints[0],
      title: "Inicio",
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    routesMarkers.push(marker);

    var marker = new google.maps.Marker({
      position: endingpos,
      title: "Fim",
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    routesMarkers.push(marker);

    for (i = 0; i < k.length; i++) {

      var marker = new google.maps.Marker({
        position: treatedwaypoints[i],
        title: "Ponto de interesse",
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });

      routesMarkers.push(marker);
    }

    addIncidents(doc);

    var pathwalk = new google.maps.Polyline({
      path: treatedpoints,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      travelMode: 'WALKING'
    }, function (response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        alert('Could not display directions due to: ' + status);
      }
    });
    pathwalk.setMap(map);
    map.setZoom(18);
    map.panTo(initialpos);
    getHotelsNearby(initialpos.lat, initialpos.lng);

  });

}

function createMapMode() {

  drawing = true;
  for (var i = 0; i < routesMarkers.length; i++) {
    routesMarkers[i].setMap(null);
  }
  directionsDisplay.set('directions', null);

  var createPointListener = google.maps.event.addListener(map, 'click', function (event) {
    var point = new google.maps.Marker({
      position: event.latLng,
      map: map
    });
    points.push(point);
  });

  alert("Escolha o ponto inicial, pontos de interesse e ponto final. Depois clique em Build Map");

  document.getElementById('buildMap').onclick = function () {

    google.maps.event.removeListener(createPointListener);

    var waypts = [];
    points[0].setMap(null);
    for (var i = 1; i < points.length - 1; i++) {
      waypts.push({
        location: points[i].position,
        stopover: true
      });
      points[i].setMap(null);
    }
    points[points.length - 1].setMap(null);

    directionsService.route({
      origin: points[0].position,
      destination: points[points.length - 1].position,
      waypoints: waypts,
      travelMode: 'WALKING'
    }, function (response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        alert('Could not display directions due to: ' + status);
      }
    });
    alert("Arraste o caminho no mapa e clique em Add Map.")
  }
  directionsDisplay.setOptions({ draggable: true });

  directionsDisplay.addListener('directions_changed', function () {
    if (save) {
      saveRoute();
    }
  });

  document.getElementById('addMap').onclick = function (event) {
    var distance = 0;
    for (i = 0; i < directionsDisplay.directions.routes[0].legs.length; i++) {
      distance += parseFloat(directionsDisplay.directions.routes[0].legs[i].distance.value);
    }

    var initialPoint = String(points[0].position).replace('(', '').split(",", 2);

    //add route to firestore
    db.collection("routes").add({
      lat: parseFloat(initialPoint[0]),
      lng: parseFloat(initialPoint[1]),
      name: "test Name",
      description: "Some small description of the route.",
      meters: distance,
      difficulty: 2,
      directions: JSON.stringify(directionsDisplay.directions)
    })

    //"fechar" drawing mode
    points = [];
    previousRoutes = [];
    pRoutesNumber = -1;
    directionsDisplay.set('directions', null);
    directionsDisplay.setOptions({ draggable: false });
    drawing = false;

  }

}

function showHotelsNearMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);
      getHotelsNearby(position.coords.latitude, position.coords.longitude);

    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}

function saveRoute() {
  pRoutesNumber += 1;
  if (pRoutesNumber == MAX_PREVIOUS) {
    pRoutesNumber = 0;
  }
  previousRoute[pRoutesNumber] = directionsDisplay.directions;
}

function previousRoute() {
  pRoutesNumber--;
  if (pRoutesNumber == -1) {
    pRoutesNumber = MAX_PREVIOUS - 1;
  }
  save = false;
  directionsDisplay.setDirections(previousRoute[pRoutesNumber]);
  save = true;
}



function callback(results, status) {
  console.log('status after createmarker: ' + status);
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      console.log('result after createmarker: ' + results);
    }
  }
}



function getHotelsNearby(lat, lng){
  console.log('lati: ' + lat);
  console.log('long: ' + lng);
  
  var centerS = new google.maps.LatLng(lat, lng);
  console.log('center s: ' + centerS);

  var request = {
    location: centerS,
    radius: 5000,
    type: ['lodging']
  };

  hotelInfoWindow = new google.maps.InfoWindow();

  service = new google.maps.places.PlacesService(map);
  console.log('service string: ' + service);
  service.nearbySearch(request, callback);
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    hotelInfoWindow.setContent(place.name);
    hotelInfoWindow.open(map, this);
  });
}