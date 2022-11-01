//here most of the code are related to the user data, and according to that
// it delegate the action
// import '@babel/polyfill'


import { login, logout,signup } from './login.js' 
import {peer, registerPeer, connect } from './home.js'
import { overlap } from './overlap.js'
import { disconnect } from './disconnect.js'
import { updateSettings } from './updateSettings.js'


//dom elements 


const logoutBtn = document.querySelector('#logoutBtn')
const signupBtn = document.getElementById('_signupBtn')
const loginBtn = document.getElementById('loginBtn')
const dataStore = document.getElementById('dataStore')
const receiverPeerIdInput = document.getElementById('usr')
const cntBtn = document.getElementById('cntBtn')
const imgStk = document.querySelector('.image-stack')
const disCnt = document.getElementById('disCnt')
const Cnt = document.getElementsByClassName('Cnt')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')


//values

 

//delegation mapping
if( userDataForm){
    
    userDataForm.addEventListener('submit',(e )=>{
        e.preventDefault()
        //creating the enctype form data
        const form = new FormData()
        form.append('email', document.getElementById('email').value)
        form.append('name', document.getElementById('name').value)
        form.append('bio', document.getElementById('bio').value)
        form.append('photo', document.getElementById('photo').files[0])

        // console.log(form)

        updateSettings(form , 'data')
    })
   
}

if( userPasswordForm){
    
    userPasswordForm.addEventListener('submit',async (e )=>{
        e.preventDefault()
        document.querySelector('.btn--save-password').innerHTML = 'Updating...'
        const currentPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value

        //console.log(passwordConfirm, passwordCurrent, password)
        await updateSettings({currentPassword ,password,passwordConfirm} , 'password')

        document.querySelector('.btn--save-password').innerHTML = 'Save Password'

        document.getElementById('password-current').value= '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value= '';
    })
   
}

if( disCnt){
    disCnt.addEventListener('click',(e)=>{
        e.preventDefault()
        const wrksDataStore = document.getElementById('wrksDataStore')
        const connId = wrksDataStore.dataset.connid
        disconnect(connId)
    })
}
if(imgStk){
    // console.log( 'image stack delegation ')
    const wrksDataStore = document.getElementById('wrksDataStore')
    var recPeerId = wrksDataStore.dataset.recpeerid
    var calPeerId = wrksDataStore.dataset.calpeerid
    console.log(recPeerId, calPeerId)
    overlap(calPeerId, recPeerId)
}
if( dataStore && receiverPeerIdInput && cntBtn){
    
    
    const Id = dataStore.dataset.id
    const callerPeerId = dataStore.dataset.peerid

    console.log(callerPeerId)
    registerPeer(Id,callerPeerId)

    cntBtn.addEventListener('click', (e)=> {
        e.preventDefault()
        const receiverPeerId = receiverPeerIdInput.value
        if(receiverPeerId === ""){
            alert('put an id')
        }
        else{
            console.log(receiverPeerId)
            connect(Id,callerPeerId,receiverPeerId)
        }
        
    })

    if( Cnt){
        for (var i = 0; i<Cnt.length;i++){
            Cnt[i].addEventListener('click', function(e){
                e.preventDefault()
                // console.log(i,this)
                const _peerId = this.dataset.peerid
                connect(Id,callerPeerId, _peerId )
            })
            
    
        };
    
    }
}
if(signupBtn){
    signupBtn.addEventListener('click', e => {
        e.preventDefault()
        
        const name = document.getElementById('name').value
        const peerId = document.getElementById('peerId').value
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('passwordConfirm').value
        signup(name , email,peerId, password, passwordConfirm)
    })
}

if(logoutBtn){
    logoutBtn.addEventListener('click' , logout)
}
if(loginBtn){
    loginBtn.addEventListener('click', (e)=> {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email,password)
    })
}
// if( userDataForm){
    
//     userDataForm.addEventListener('submit',(e )=>{
//         e.preventDefault()
//         //creating the enctype form data
//         const form = new FormData()
//         form.append('email', document.getElementById('email').value)
//         form.append('name', document.getElementById('name').value)
//         form.append('photo', document.getElementById('photo').files[0])

//         // console.log(form)

//         updateSettings(form , 'data')
//     })
   
// }

// if( userPasswordForm){
    
//     userPasswordForm.addEventListener('submit',async (e )=>{
//         e.preventDefault()
//         document.querySelector('.btn--save-password').innerHTML = 'Updating...'
//         const currentPassword = document.getElementById('password-current').value
//         const password = document.getElementById('password').value
//         const passwordConfirm = document.getElementById('password-confirm').value

//         //console.log(passwordConfirm, passwordCurrent, password)
//         await updateSettings({currentPassword ,password,passwordConfirm} , 'password')

//         document.querySelector('.btn--save-password').innerHTML = 'Save Password'

//         document.getElementById('password-current').value= '';
//         document.getElementById('password').value = '';
//         document.getElementById('password-confirm').value= '';
//     })
   
// }

