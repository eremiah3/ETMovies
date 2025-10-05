import "swiper/swiper.min.css";
import "./assets/boxicons-2.0.7/css/boxicons.min.css";
import "./App.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { BrowserRouter, Route } from "react-router-dom";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

import Routes from "./routes/Routes";

import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Route
          render={(props) => (
            <>
              <Header {...props} />

              <Routes />

              <Footer />
            </>
          )}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;
