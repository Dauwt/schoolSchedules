import PropTypes from "prop-types";
import { HashRouter, Link } from "react-router-dom";
import './App.css'

function Header(props) {
    return(
        <div className="header">
            <div className="header-info">
                <img src="dwtLogo.svg" alt="DWT's Logo" className="header-info-dwt-logo" />
                <div className="header-info-title">{props.headerTitle}</div>
            </div>
        </div>
    );
}

Header.propTypes = {
    headerTitle: PropTypes.string.isRequired
}

Header.defaultProps = {
    headerTitle: "Projects by Dauwt",
}

export default Header