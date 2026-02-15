import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "./header.scss";

import logo from "./../../assets/logo.png";

import * as Config from "./../../constants/Config";

import { useAuth } from "../../contexts/AuthContext";

const headerNav = [
  {
    display: "Home",
    path: `/${Config.HOME_PAGE}`,
  },
  {
    display: "Movies",
    path: `/${Config.HOME_PAGE}/movie`,
  },
  {
    display: "TV Series",
    path: `/${Config.HOME_PAGE}/tv`,
  },
  {
    display: "Animation",
    path: `/${Config.HOME_PAGE}/animation`,
  },
  {
    display: "Nollywood",
    path: `/${Config.HOME_PAGE}/nollywood`,
  },
];

const Header = () => {
  const { pathname } = useLocation();
  const { currentUser, logout } = useAuth();
  const headerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const active = headerNav.findIndex((e) => e.path === pathname);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  useEffect(() => {
    const shrinkHeader = () => {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        headerRef.current.classList.add("shrink");
      } else {
        headerRef.current.classList.remove("shrink");
      }
    };

    window.addEventListener("scroll", shrinkHeader);

    return () => {
      window.removeEventListener("scroll", shrinkHeader);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (!currentUser) {
    return (
      <>
        <div ref={headerRef} className="header">
          <div className="header__wrap container">
            <div className="logo">
              <img src={logo} alt="logo" />
              <Link to={`/${Config.HOME_PAGE}`}>ETMovies</Link>
            </div>
            <ul className="header__nav">
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
            {/* Hamburger Menu Button */}
            <button
              className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className="hamburger__line"></span>
              <span className="hamburger__line"></span>
              <span className="hamburger__line"></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          <div
            className="mobile-menu__content"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
          >
            <button
              className="mobile-menu__close"
              onClick={closeMobileMenu}
              aria-label="Close mobile menu"
            >
              <span className="close-icon">×</span>
            </button>

            <ul className="mobile-menu__nav">
              <li>
                <Link to="/login" onClick={closeMobileMenu}>Login</Link>
              </li>
              <li>
                <Link to="/signup" onClick={closeMobileMenu}>Sign Up</Link>
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={headerRef} className="header">
        <div className="header__wrap container">
          <div className="logo">
            <img src={logo} alt="logo" />
            <Link to={`/${Config.HOME_PAGE}`}>ETMovies</Link>
          </div>

          <ul className="header__nav">
            {headerNav.map((e, i) => (
              <li key={i} className={`${i === active ? "active" : ""}`}>
                <Link to={e.path}>{e.display}</Link>
              </li>
            ))}
            <li className="logout-section">
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </ul>

          {/* Hamburger Menu Button */}
          <button
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      >
        <div
          className="mobile-menu__content"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
        >
          <button
            className="mobile-menu__close"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            <span className="close-icon">×</span>
          </button>

          <ul className="mobile-menu__nav">
            {headerNav.map((e, i) => (
              <li key={i} className={`${i === active ? "active" : ""}`}>
                <Link to={e.path} onClick={closeMobileMenu}>
                  {e.display}
                </Link>
              </li>
            ))}
            <li>
              <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="logout-button">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
