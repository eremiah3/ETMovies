import React from "react";

import "./footer.scss";

import { Link } from "react-router-dom";

import bg from "./../../assets/footer-bg.jpg";
import logo from "./../../assets/logo.png";

import * as Config from "./../../constants/Config";

const Footer = () => {
  React.useEffect(() => {
    // Reload ng adverts script to display ads
    if (window.ngads) {
      try {
        window.ngads.load();
      } catch (e) {
        console.error('ng adverts error:', e);
      }
    }
  }, []);

  return (
    <div className="footer" style={{ backgroundImage: `url(${bg})` }}>
      <div className="footer__content container">
        <div className="footer__content__logo">
          <div className="logo">
            <img src={logo} alt="logo" />
            <Link to={`/${Config.HOME_PAGE}`}>ETMovies</Link>
          </div>
        </div>

        {/* <div className="footer__content__support">
          <h3>Support Us</h3>
          <p>If you enjoy our site, consider supporting us to keep it running.</p>
          <div className="donation-details">
            <p><strong>Bank Transfer (Naira):</strong></p>
            <p>Account Name: Omogbolahan Jeremiah Agboola</p>
            <p>Account Number: 9065291459</p>
            <p>Bank: Opay Microfinance Bank</p>
          </div>
        </div> */}

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

        <div className="footer__content__privacy">
          <h3>Privacy Policy</h3>
          <p>
            ETMovies respects your privacy. We may display ads from third-party networks to support our site. 
            No personal data is sold or shared. We use cookies to enhance your experience. By using our site, 
            you agree to our privacy practices.
          </p>
        </div>
      </div>

      {/* ng adverts - Advertisement Section - Bottom Right */}
      <div className="footer__ads">
        <div className="ad-container">
          {/* Replace YOUR_AD_CODE with your actual ng adverts code */}
          <div 
            className="ng-advert" 
            data-ad-code="YOUR_NG_ADVERTS_CODE"
            data-ad-width="300"
            data-ad-height="250"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
