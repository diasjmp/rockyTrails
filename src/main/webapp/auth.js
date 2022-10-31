// listen for auth status changes
auth.onAuthStateChanged(user => {
    // If logged in this will exist.  Otherwise will not exist and will be null
    if(user) {
        console.log('user logged in: ', user);
        setupAuthBtns(user);
    } else {
        console.log('user logged out');
        setupAuthBtns();
        $('#userarea').addClass('gone');
    }
});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location='/index.html';
    });
});

const userarea = document.querySelector('#userarea');
userarea.addEventListener('click', (e) => {
    e.preventDefault();

        window.location='/user-area.html';
});



// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const loginEmail = loginForm['login-email'].value;
    const loginPwd = loginForm['login-password'].value;

        auth.signInWithEmailAndPassword(loginEmail, loginPwd).then(cred => {
            // close modal and reset form
            const modal = document.querySelector('#login-modal');
            M.Modal.getInstance(modal).close();
            loginForm.reset();
        }). then(() => {
            window.location='user-area.html';
        }).catch(error => M.toast({html: 'A sua password ou email não estão correctos.'}));
    
});