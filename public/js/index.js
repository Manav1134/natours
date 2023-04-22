/*eslint-disable*/
import '@babel/polyfill';
import { displayMap } from "./mapbox"
import { login, logout } from "./loigin";
import {updateSettings} from "./UpdateSettings"


const mapBox= document.getElementById("map")

const loginForm= document.querySelector(".form--login")
const userDataForm= document.querySelector(".form-user-data")
const fileInput = document.querySelector('.form__upload');
const userPasswordForm= document.querySelector(".form-user-password")
const logOutBtn= document.querySelector(".nav__el--logout")

if(mapBox){
const locations= JSON.parse(document.getElementById(map).dataset.locations);
displayMap(locations)
}

if(loginForm)
loginForm.addEventListener("submit",e=>{
    e.preventDefault();
    const email=document.getElementById("email").value;//we use value propert in order to read value
const password=document.getElementById("password").value;

    login(email,password)
   })

if(logOutBtn) logOutBtn.addEventListener("click", logout)

if(userDataForm)
{userDataForm.addEventListener("submit",e=> {
e.preventDefault()
const form= new FormData();
form.append("name",document.getElementById("name").value)
form.append("email",document.getElementById("email").value )


updateSettings(form,"data")
})}


if(userPasswordForm)
{userPasswordForm.addEventListener("submit",async e=> {
e.preventDefault()
document.querySelector(".btn--save-password ").innerHTML="Updating....."
const passwordCurrent=document.getElementById("password-current").value;
const password=document.getElementById("password").value;
const passwordConfirm=document.getElementById("password-confirm").value;
await updateSettings({ passwordCurrent,password,passwordConfirm},"password")

document.querySelector(".btn--save-password ").innerHTML="save password"

document.getElementById("password-current").value=""
document.getElementById("password").value=""
document.getElementById("password-confirm").value=""
})}

if (fileInput)
  fileInput.addEventListener('change', async (e) => {
    const form = new FormData();
    form.append('photo', document.getElementById('photo').files[0]);
 
    // Take care of the type attribute being photo
    const newImage = await updateSettings(form, 'photo');
 
    if (newImage) {
      document
        .querySelector('.nav__user-img')
        .setAttribute('src', `/img/users/${newImage}`);
      document
        .querySelector('.form__user-photo')
        .setAttribute('src', `/img/users/${newImage}`);
    }
  });