import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import Tabs from "./Components/Tabs";

function App() {
  return (
    <div className="App app-wrapper">
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return <Redirect to="/tabs" />;
            }}
          />
          <Route path="/tabs" component={Tabs} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
