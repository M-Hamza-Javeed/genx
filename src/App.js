import Sidenav from './comm/design/comm/Sidenav'
import Menu from './comm/design/comm/Home'
import {Topnav} from './comm/design/comm/Topnav'
import {ContextProvider} from './comm/contexApi/Dataprovide'
import React from 'react';
import {BrowserRouter as Router,Switch,Route,Link} from "react-router-dom";
import GrapejsEditor from './comm/design/comm/Grapesjs'


function App() {
  return (
    <ContextProvider>
      <Router>
          <Switch>
            <Route path="/HTMLEditor">
              <GrapejsEditor/>
            </Route>
            <Route path="/">
            <div className="App"><div><Sidenav></Sidenav><Topnav></Topnav></div><Menu></Menu></div>
            </Route>
          </Switch>
      </Router>
    </ContextProvider>
  );
}


export default App;
