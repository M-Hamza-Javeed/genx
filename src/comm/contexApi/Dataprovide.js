import React,{useState} from 'react'

export const Context = React.createContext({
    SideNavBtn:'Home',
    Htmlpage:"<div>Hi Hamza. how's going</div>"
});


export const ContextProvider=(props)=>{
    const [state,setstate]=useState({
        SideNavBtn:'Home' , Htmlpage:""
    })
    return (
        <Context.Provider value={[state,setstate]}>
        {props.children}
        </Context.Provider>
    )
}

