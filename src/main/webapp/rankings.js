const rankingsList = document.querySelector('#rankings-list');

// create element and render rank
function renderRank(doc) {

    var userName = doc.data().name + " " + doc.data().surname;

    let li = document.createElement('li');
    let name = document.createElement('span');
    let points = document.createElement('span');

    li.setAttribute('data-id', doc.id);
    name.textContent = userName;
    points.textContent = doc.data().score;

    li.appendChild(name);
    li.appendChild(points);

    rankingsList.appendChild(li);
}

db.collection('users').orderBy('score', 'desc').limit(15).get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
        renderRank(doc);        
    });
})