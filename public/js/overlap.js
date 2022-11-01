import axios from "axios"

export async function overlap(calpeerid, recpeerid) {
    const _top = document.getElementById('top-img')
    const btm = document.getElementById('btm-img')

      try{
        var res = await axios({
          method: 'GET',
          url: '/api/v1/users/photo/'+calpeerid
        })
        if( res.data.status === 'success'){
          // console.log(res.data)
          var senSrc = res.data.data
          btm.setAttribute('src','/img/users/'+senSrc)
          // console.log(senSrc)
        }else{
          console.log( res.data)
        }

        res = await axios({
          method: 'GET',
          url: '/api/v1/users/photo/'+recpeerid
        })
        if( res.data.status === 'success'){
          // console.log(res.data)
          var recSrc = res.data.data 
          _top.setAttribute('src','/img/users/'+ recSrc)
          // console.log( recSrc)
        }else{
          console.log( res.data)
        }
        
      }catch( err){
        console.log( err)
      }
    
    
    
      
    
  }
  