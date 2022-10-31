// signup
const editForm = document.querySelector('#edit-form');

editForm.addEventListener('submit', (e) => {
    // prevents the sign up button from refreshing the page when pressed
    e.preventDefault();

    var uID = auth.currentUser.uid;
    // get user info
    const firstName = editForm['edit-name'].value;
    const lastName = editForm['edit-surname'].value;
    const addr = editForm['edit-address'].value;
    const phone = editForm['edit-phone'].value;

    // Get the user document
    var user = db.collection('users').doc(uID);

    if (firstName.lentgh == 0) {
        user.update({
            surname: lastName,
            address: addr,
            phonenr: phone
        }).then(() => {
            M.toast({ html: 'Os seus dados foram actualizados.' });
            console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
    } else if (lastName.lentgh == 0) {
        user.update({
            name: firstName,
            address: addr,
            phonenr: phone
        }).then(() => {
            M.toast({ html: 'Os seus dados foram actualizados.' });
            console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
    } else if (addr.lentgh == 0) {
        user.update({
            name: firstName,
            surname: lastName,
            phonenr: phone
        }).then(() => {
            M.toast({ html: 'Os seus dados foram actualizados.' });
            console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
    } else if(phone.lentgh == 0) {
        user.update({
            name: firstName,
            surname: lastName,
            address: addr
        }).then(() => {
            M.toast({ html: 'Os seus dados foram actualizados.' });
            console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
    } else {
        user.update({
            name: firstName,
            surname: lastName,
            address: addr,
            phonenr: phone
        }).then(() => {
            M.toast({ html: 'Os seus dados foram actualizados.' });
            console.log("Document successfully updated!");
        }).catch(error => M.toast({ html: 'Algo falhou. Por favor, tente outra vez.' }));
    }
});

