// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

});


const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLink = document.querySelector('.logged-in');

const setupAuthBtns = (user) => {

    if(user) {
        // toggle UI elements
        loggedInLink.style.visibility = 'visible';
        loggedInLink.style.position = 'initial';
        loggedInLink.style.pointerEvents = 'all';

        loggedOutLinks.forEach(item => item.style.position = 'absolute');
        loggedOutLinks.forEach(item => item.style.pointerEvents = 'none');
        loggedOutLinks.forEach(item => item.style.visibility = 'hidden');
    } else {
        // toggle UI elements
        loggedInLink.style.visibility = 'hidden';
        loggedInLink.style.pointerEvents = 'none';
        loggedInLink.style.position = 'absolute';
        
        loggedOutLinks.forEach(item => item.style.visibility = 'visible');
        loggedOutLinks.forEach(item => item.style.position = 'initial');
        loggedOutLinks.forEach(item => item.style.pointerEvents = 'all');
    }
}