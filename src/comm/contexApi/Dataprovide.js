import React,{useState} from 'react'

export const Context = React.createContext({
    Activebtn:'home'
});


export const ContextProvider=(props)=>{
    const [state,setstate]=useState({
        SideNavBtn:'home'
    })
    return (
        <Context.Provider value={[state,setstate]}>
        {props.children}
        </Context.Provider>
    )
}

