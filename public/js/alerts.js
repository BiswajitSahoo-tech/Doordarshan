
const hideAlert = ()=>{
    
    const el = document.querySelector('.alert')
    //console.log(el)
    if(el){
        
        el.parentElement.removeChild(el)
    }
}
export const showAlerts = (type , msg)=>{
    hideAlert()
    const clas = "alert alert--"+type
    const markup = '<div class = "'+clas+'" >' + msg + '</div>'
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup)

    window.setTimeout(hideAlert , 5000)

}
