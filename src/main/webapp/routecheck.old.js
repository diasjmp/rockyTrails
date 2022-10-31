var map;
var directionsDisplay;
var directionsService;

var routesMarkers = [];
var infowindow;

var points = [];
var previousRoutes = [];
var pRoutesNumber = -1;
const MAX_PREVIOUS = 5;
var save = true;

var drawing = false;

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:  38.659784, lng:  -9.202765},
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

      document.getElementById('back').onclick = function(event) {
        if(drawing){
            previousRoute();
        }else{
            for (var i = 0; i < routesMarkers.length; i++) {
                routesMarkers[i].setMap(map);
              }
            directionsDisplay.set('directions', null);
        }
      }

      document.getElementById('createMap').onclick = function(event) {
        createMapMode();
      }

}

function centerOnMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}

function resetMap() { 
  alert('got in');
 initMap();
}

function addInitialPoints(){
    routesMarkers = [];

    //TODO - (resolver) tá a ir buscar todos os dados, incluindo as direções que não são precissas
    //getting data from firestore
    db.collection("routes").get().then((snapshot) => {
      snapshot.docs.forEach(doc => {
        var marker = new google.maps.Marker({
          position: {lat: doc.data().lat, lng: doc.data().lng},
          map: map
      });

      var o = doc.id;

     var routepoints = doc.data().waypts;
     
      var contentString = '<div id="content">'+
                          '<h1 id="title">'+doc.data().name+'</h1>'+
                          '<p>Distância: '+doc.data().meters+'</p>'+
                          '<p>Dificuldade: '+doc.data().difficulty+'</p>'+
                          '<p>Descrição: '+doc.data().description+'</p>'+
                          '<button type="button" onclick="printRoute(\''+o+'\')">See Route</button> ';
      

      marker.addListener('click', function() {
          if (infowindow) {
              infowindow.close();
          }
          infowindow = new google.maps.InfoWindow({content: contentString});
          infowindow.open(map, marker);
      });
      
      routesMarkers.push(marker);
      })
    })
}


function printRoute(doc){

  db.collection("routes").doc(doc).onSnapshot(function(document) {
    var j = document.get("points");
    var k = document.get("waypoints");
    var name = document.data().name;
    var initialpos =  {lat: document.data().lat, lng: document.data().lng}
    var endingpos =  {lat: j[j.length-1].latitude, lng: j[j.length-1].longitude}
    console.log(j[0].latitude);

    var treatedpoints = new Array(j.length);
    var treatedwaypoints = new Array(k.length);

    for (var i = 0; i < routesMarkers.length; i++) {
        routesMarkers[i].setMap(null);
      }
    directionsDisplay.set('directions', null);

    for (i=0; i < j.length; i++) {
      treatedpoints[i] = {lat: j[i].latitude, lng: j[i].longitude}
    }

    for (i=0; i < k.length; i++) {
      treatedwaypoints[i] = {lat: k[i].latitude, lng: k[i].longitude}
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

  for (i=0; i < k.length; i++) {

    var marker = new google.maps.Marker({
      position: treatedwaypoints[i],
      title: "Ponto de interesse",
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
  });

   routesMarkers.push(marker);
  }
  

    var pathwalk = new google.maps.Polyline({
      path: treatedpoints,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      travelMode: 'WALKING'
    }, function(response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        alert('Could not display directions due to: ' + status);
      }
    });
    pathwalk.setMap(map);
    map.setZoom(18);
    map.panTo(initialpos);
    });

}

function createMapMode(){
    
    drawing = true;
    for (var i = 0; i < routesMarkers.length; i++) {
        routesMarkers[i].setMap(null);
      }
    directionsDisplay.set('directions', null);

    var createPointListener = google.maps.event.addListener(map, 'click', function(event) {
      var point = new google.maps.Marker({
          position: event.latLng,
          map: map
        });
      points.push(point);
    });

alert("Escolha o ponto inicial, pontos de interesse e ponto final. Depois clique em Build Map");
    
document.getElementById('buildMap').onclick = function() {

    google.maps.event.removeListener(createPointListener);

        var waypts = [];
        points[0].setMap(null);
        for(var i = 1; i < points.length -1; i++){
            waypts.push({
                location: points[i].position,
                stopover: true
            });
            points[i].setMap(null);
        }
        points[points.length -1].setMap(null);

        directionsService.route({
            origin: points[0].position,
            destination: points[points.length-1].position,
            waypoints: waypts,
            travelMode: 'WALKING'
          }, function(response, status) {
            if (status === 'OK') {
              directionsDisplay.setDirections(response);
            } else {
              alert('Could not display directions due to: ' + status);
            }
          });
alert("Arraste o caminho no mapa e clique em Add Map.")
    }
    directionsDisplay.setOptions({draggable: true});

    directionsDisplay.addListener('directions_changed', function() {
        if(save){
          saveRoute();
        }
      });

      document.getElementById('addMap').onclick = function(event) {
        var distance= 0;
        for(i = 0; i < directionsDisplay.directions.routes[0].legs.length; i++){
          distance += parseFloat(directionsDisplay.directions.routes[0].legs[i].distance.value);
        }

        var initialPoint = String(points[0].position).replace('(','').split(",", 2);
       
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
        directionsDisplay.setOptions({draggable: false});
        drawing = false;

      }
    
}

function saveRoute(){
    pRoutesNumber+=1;
    if(pRoutesNumber == MAX_PREVIOUS){
      pRoutesNumber = 0;
    }
    previousRoute[pRoutesNumber] = directionsDisplay.directions;
  }
  
  function previousRoute(){
    pRoutesNumber--;
    if(pRoutesNumber == -1){
      pRoutesNumber = MAX_PREVIOUS-1;
    }
    save = false;
    directionsDisplay.setDirections(previousRoute[pRoutesNumber]);
    save = true;
  }