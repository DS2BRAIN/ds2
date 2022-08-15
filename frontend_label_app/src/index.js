// @flow

import React from "react"
import ReactDOM from "react-dom"
import Theme from "./Theme"
import DemoSite from "./DemoSite"
import LandingPage from "./LandingPage"
import './lang/i18n';
import "./site.css"

const Site = () => {
  return <Theme><DemoSite /></Theme>
}

ReactDOM.render(<Site />, document.getElementById("root"))
