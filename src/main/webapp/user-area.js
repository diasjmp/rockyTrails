auth.onAuthStateChanged(function(user) {
    if (user) {

        var current = user.uid;
        console.log(current);
        var loggeduser = db.collection('users').doc(current);

        loggeduser.get().then(function(doc2) {
    
            fullauthorname = doc2.data().name + " " + doc2.data().surname;
             
            let li = document.createElement('li');
            //let foto = document.createElement('img');
            let name = document.createElement('h4');
            let score = document.createElement('p');
            let phones = document.createElement('p');
            let add = document.createElement('p');

        
           // li.setAttribute('data-id', doc2.id);
            name.textContent = fullauthorname;
            score.textContent = doc2.data().score;
            phones.textContent = doc2.data().phonenr;
            add.textContent = doc2.data().address;
            
            //foto.src= 'data:image/png;base64, ' +doc2.data().commentImg;
            
    
           // li.appendChild(name);
            //li.appendChild(foto);
        
            $('.user-score').append(score);
            $('.user-area-user-name').append(name);
            $('.user-area-address').append(add);
            $('.user-area-phone').append(phones);
            
            db.collection('users').doc(current).collection('completedRoutes').get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                  completeRoutes(doc);
                })
              })
    
        
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });

    } else {
        
      return -1;
    }
  });

function completeRoutes(doc3) {
    // Users - uid - completedRoutes - doc - routeId
    // Routes - routeId - name
    var routeId;
    var routeDist;
    var routePoints;
    var routeName;

    var fullroute = db.collection('routes').doc(doc3.data().routeID);
  
    fullroute.get().then(function (doc) {
      routeName = doc.data().name;
      routeDist = doc3.data().distance;
      routePoints = doc3.data().points;
      routeDuration = doc3.data().duration;
      routeRating = doc3.data().rating;
  
      let li = document.createElement('li');
      let nameR = document.createElement('p');
      let distR = document.createElement('p');
      let ptsR = document.createElement('p');
      let dur = document.createElement('p');
      let rating= document.createElement('p');
  
  
      li.setAttribute('data-id', doc3.id);
      nameR.textContent = routeName; // Este name e o da colecao routes, ou devia ser
      distR.textContent = routeDist; // referente a colecao completedRoutes do user
      ptsR.textContent = routePoints; // referente a colecao completedRoutes do user
      dur.textContent = routeDuration;
      rating.textContent = routeRating;

      li.appendChild(nameR);
      li.appendChild(distR);
      li.appendChild(ptsR);
      li.appendChild(dur);
      li.appendChild(rating);
  
      $('#completed-route-list').append(li);
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  
  }