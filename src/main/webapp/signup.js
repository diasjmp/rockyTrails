// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    // prevents the sign up button from refreshing the page when pressed
    e.preventDefault();
    
    // get user info
    const firstName = signupForm['signup-name'].value;
    const lastName = signupForm['signup-surname'].value;
    const email = signupForm['signup-email'].value;
    const addr = signupForm['signup-address'].value;
    const phone = signupForm['signup-phone'].value;
    const password = signupForm['signup-password'].value;
    const confirmation = signupForm['signup-confirmation'].value;
    

    if (password != confirmation) {
        M.toast({html: 'A password que inseriu não está igual à sua confirmação.'});
    } else {

            // sign up the user - async task
        auth.createUserWithEmailAndPassword(email, password).then(cred => {
            // create document reference with id of user
            return db.collection('users').doc(cred.user.uid).set({
                name: firstName,
                surname: lastName,
                email: email,
                address: addr,
                phonenr: phone,
                score: 0,
                creationDate: new Date()
            });
        }).then(() => {
            window.location='user-area.html';
        }).catch(error => M.toast({html: 'O email que introduziu já se encontra em utilização.'}));
    }
});