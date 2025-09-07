import React from "react";

import "./footer.scss";

import { Link } from "react-router-dom";

import bg from "./../../assets/footer-bg.jpg";
import logo from "./../../assets/logo.png";

import * as Config from "./../../constants/Config";

const Footer = () => {
  return (
    <div className="footer" style={{ backgroundImage: `url(${bg})` }}>
      <div className="footer__content container">
        <div className="footer__content__logo">
          <div className="logo">
            <img src={logo} alt="logo" />
            <Link to={`/${Config.HOME_PAGE}`}>ETMovies</Link>
          </div>
        </div>

        <div className="footer__content__support">
          <h3>Support Us</h3>
          <p>If you enjoy our site, consider supporting us to keep it running.</p>
          <div className="donation-details">
            <p><strong>Bank Transfer (Naira):</strong></p>
            <p>Account Name: Oluwatoyin Agboola</p>
            <p>Account Number: 2095003586</p>
            <p>Bank: Addosser Microfinance Bank</p>
          </div>
        </div>

        {/* <div className="footer__content__menus">
          <div className="footer__content__menu">
            <Link to={`/${Config.HOME_PAGE}`}>Home</Link>
            <Link to={`/${Config.HOME_PAGE}`}>Contact us</Link>
            <Link to={`/${Config.HOME_PAGE}`}>Term of service</Link>
            <Link to={`/${Config.HOME_PAGE}`}>About us</Link>
          </div>
          <div className="footer__content__menu">
            <Link to={`/${Config.HOME_PAGE}`}>Live</Link>
            <Link to={`/${Config.HOME_PAGE}`}>FAQ</Link>
            <Link to={`/${Config.HOME_PAGE}`}>Premium</Link>
            <Link to={`/${Config.HOME_PAGE}`}>Privacy policy</Link>
          </div>
          <div className="footer__content__menu">
            <Link to={`/${Config.HOME_PAGE}`}>You must watch</Link>
            <Link to={`/${Config.HOME_PAGE}`}>Recent release</Link>
            <Link to={`/${Config.HOME_PAGE}`}>Top IMDB</Link>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Footer;
