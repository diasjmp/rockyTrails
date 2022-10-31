const pwdForm = document.querySelector('#pwd-form');

// Edit Pwd
pwdForm.addEventListener('submit', (e) => {
    // prevents the sign up button from refreshing the page when pressed
    e.preventDefault();

    var user = auth.currentUser;

    var newPassword = pwdForm['pwd-password'].value;
    var confirmation = pwdForm['pwd-confirmation'].value;

    if (newPassword != confirmation) {
        M.toast({ html: 'A password que inseriu não está igual à sua confirmação.' });
    } else {
        user.updatePassword(newPassword).then(function () {
            M.toast({ html: 'password actualizada.' });
            console.log("Pass changed");
        }).catch(error => M.toast({ html: 'Tente outra vez.' }));
    }
});