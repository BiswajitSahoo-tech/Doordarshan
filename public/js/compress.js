import axios from "axios"

export const _compress = async  ( file) =>{
    console.log('KAUA---',file)
    const form = new FormData()
    form.append('file', file)
    try{
        const res = await axios( {
                        method: 'POST',
                        url: '/compress',
                        data: form
                    })


           if( res.status === 200){
            console.log('HURRAY', res.data)
            signal_compress(res.status, res.data)
                                    
                                
           }
           else{
            console.log(statusText)
            signal_compress(res.status, res.data)
           }
           
    } catch( err){
        console.log(err)
        
    }
   
}