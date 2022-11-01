import axios from "axios"
import { showAlerts } from "./alerts"

//type is either pwd and data
// we are cutting the local host address from the api calls, because
// when deploying the frontend url and the api url would be same
//and we can go for relative path
//this might be a case where we have two diff 
//url for api and frontend , then rel url wont work
export const updateSettings = async  ( data, type) =>{
    
    try{
        const url = type ==='password'? '/api/v1/users/updatePassword/': '/api/v1/users/updateMe/'
        const res = await axios( {
            method: 'PATCH',
            url,
            data
           })


           if( res.data.status === 'success'){
                const d = type ==='password'? 'PASSWORD' :'DATA'
                showAlerts('success' , d+' updated successfully')
                // alert('success')
                location.reload(true)
           }
        //    console.log( res)
    } catch( err){
        // console.log( err)
        showAlerts( 'error' ,  err.response.data.message)
        // alert('fail')
    }
   
}