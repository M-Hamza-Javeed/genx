import Sidenav from './comm/design/comm/Sidenav'
import Menu from './comm/design/comm/Home'
import {Topnav} from './comm/design/comm/Topnav'
import {ContextProvider} from './comm/contexApi/Dataprovide'
import React from 'react';


function App() {
  return (
    <ContextProvider>
    <div className="App">
      <div>
      <Sidenav></Sidenav>
      <Topnav></Topnav>
      </div>
      <Menu></Menu>
    </div>
    </ContextProvider>
  );
}

export default App;
