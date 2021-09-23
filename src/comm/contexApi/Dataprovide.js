import React,{useState} from 'react'

export const Context = React.createContext({
    Activebtn:'home',
    Htmlpage:"<div>Hi Hamza. how's going</div>"
});


export const ContextProvider=(props)=>{
    const [state,setstate]=useState({
        SideNavBtn:'home' , Htmlpage:"<div>Hi Hamza. how's going</div>"
    })
    return (
        <Context.Provider value={[state,setstate]}>
        {props.children}
        </Context.Provider>
    )
}

