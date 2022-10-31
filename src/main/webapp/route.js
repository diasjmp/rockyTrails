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
        "color": "#f5f5f5"
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
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
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
        $('#input-fields').addClass('input-fields-activated');
        createMapMode();
      }

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

     var o = "a";
      var contentString = '<div id="content">'+
                          '<h4 id="title">'+doc.data().name+'</h4>'+
                          '<p>Distância: '+doc.data().meters+'</p>'+
                          '<p>Dificuldade: '+doc.data().difficulty+'</p>'+
                          '<p>Descrição: '+doc.data().description+'</p>'+
                          '</div> ';
      
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
    
alert("Escolha o ponto inicial, , pontos intermédios, ponto final e preencha os campos abaixo. Depois clique em Construir Mapa");
    
document.getElementById('buildMap').onclick = function() {

    google.maps.event.removeListener(createPointListener);

        var waypts = [];

        if (typeof points[1] === "undefined") {
          M.toast({html: 'Não escolheu pontos suficientes para a sua rota carregue em criar rota outra vez e tente de novo'})
          $('#input-fields').removeClass('input-fields-activated');
          return -1;
        }

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
alert("Arraste o caminho no mapa e clique em Adicionar Mapa.")
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


        var geopoints = new Array();

        for(f = 0; f<points.length ; f++) {
          var b = String(points[f].position).replace('(','').replace(')','').split(",", 2);
          var a = new firebase.firestore.GeoPoint(Number(b[0]), Number(b[1]));
          geopoints.push(a);
        }

        var initialPoint2 = String(points[0].position).replace('(','').split(",", 2);
        var initialgeo = geopoints[0];
        
        console.log($('#rdescription').val());

        if ($('#rdescription').val().length == 0) {
          alert('Não escreveu uma descrição carregue em criar rota outra vez e tente de novo');
          $('#input-fields').removeClass('input-fields-activated');
          return -1;
        }

        if ($('#rname').val().length == 0) {
          alert('Não escreveu um nome para a sua rota carregue em criar rota outra vez e tente de novo');
          $('#input-fields').removeClass('input-fields-activated');
          return -1;
        }

        

        

        //add route to firestore
        db.collection("routes").add({
          lat: parseFloat(initialPoint2[0]),
          lng: parseFloat(initialPoint2[1]),
          name: $('#rname').val(),
          description: $('#rdescription').val(),
          meters: distance,
          difficulty: parseInt($('#rdifficulty').val()),
          doneCounter: 0,
          initialPoint: initialgeo,
          points: geopoints,
          rateCounter: 0,
          rating: 0,
          totalTime: 0,
          waypoints: new Array()

          
      })

      $('#rdifficulty').attr('value', '');  
      $('#rdescription').attr('value', '');  
      $('#rname').attr('value', '');  
      $('#input-fields').removeClass('input-fields-activated');

        //"fechar" drawing mode
        
        points = [];
        previousRoutes = [];
        pRoutesNumber = -1;
        directionsDisplay.set('directions', null);
        directionsDisplay.setOptions({draggable: false});
        drawing = false;
        alert('Rota criada com sucesso');

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