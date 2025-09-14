import React, { useEffect, useRef, useState } from "react";

import SwiperCore, { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import Button, { OutlineButton } from "./../button/Button";
import Modal, { ModalContent } from "./../modal/Modal";

import tmdbApi, { category, movieType } from "./../../api/tmdbApi";
import apiConfig from "./../../api/apiConfig";

import "./hero-slide.scss";
import { useHistory } from "react-router";

import * as Config from "./../../constants/Config";

// Particle Background Component
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        this.opacity += (Math.random() - 0.5) * 0.02;
        this.opacity = Math.max(0.1, Math.min(1, this.opacity));
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('hsl', 'hsla').replace(')', `, ${this.opacity})`);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(100, 200, 255, ${(150 - distance) / 150 * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

const HeroSlide = () => {
  SwiperCore.use([Autoplay]);

  const [movieItems, setMovieItems] = useState([]);

  useEffect(() => {
    const getMovies = async () => {
      const params = { page: 1 };
      try {
        const response = await tmdbApi.getMoviesList(movieType.popular, {
          params,
        });
        setMovieItems(response.results.filter(item => item.title !== "Demon Slayer: Kimetsu no Yaiba Infinity Castle").slice(0, 4));
        console.log(response);
      } catch {
        console.log("error");
      }
    };
    getMovies();
  }, []);

  return (
    <div className="hero-slide">
      <ParticleBackground />
      <div className="hero-slide__container">
        <Swiper
          modules={[Autoplay]}
          grabCursor={true}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 6000 }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
        >
          {movieItems.map((item, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <HeroSlideItem
                  item={item}
                  className={`${isActive ? "active" : ""}`}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {movieItems.map((item, index) => (
          <TrailerModal key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

const HeroSlideItem = (props) => {
  let history = useHistory();
  const item = props.item;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef(null);

  const background = apiConfig.originalImage(
    item.backdrop_path ? item.backdrop_path : item.poster_path
  );

  const handleMouseMove = (e) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  const setModalActive = async () => {
    const modal = document.querySelector(`#modal_${item.id}`);

    const videos = await tmdbApi.getVideos(category.movie, item.id);

    if (videos.results.length > 0) {
      const videoSrc = "https://www.youtube.com/embed/" + videos.results[0].key;
      modal
        .querySelector(".modal__content > iframe")
        .setAttribute("src", videoSrc);
    } else {
      modal.querySelector(".modal__content").innerHTML = "No trailer";
    }

    modal.classList.toggle("active");
  };

  return (
    <div
      ref={itemRef}
      className={`hero-slide__item ${props.className}`}
      style={{ backgroundImage: `url(${background})` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="hero-slide__item__content container">
        <div className="hero-slide__item__content__info">
          <h2 className="title" style={{
            transform: isHovered ? `translateY(-10px) rotateX(${mousePosition.y * 0.01}deg)` : 'translateY(0)',
            textShadow: isHovered ? `0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)` : 'none'
          }}>
            {item.title}
          </h2>
          <div className="overview" style={{
            transform: isHovered ? `translateY(-5px)` : 'translateY(0)',
            filter: isHovered ? 'blur(0px)' : 'blur(0.5px)'
          }}>
            {item.overview}
          </div>
          <div className="btns">
            <Button
              onClick={() =>
                history.push(`/${Config.HOME_PAGE}/movie/` + item.id)
              }
              style={{
                transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              Watch now
            </Button>
            <OutlineButton
              onClick={setModalActive}
              style={{
                transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                boxShadow: isHovered ? '0 10px 30px rgba(255,255,255,0.2)' : 'none'
              }}
            >
              Watch trailer
            </OutlineButton>
          </div>
        </div>

        <div className="hero-slide__item__content__poster">
          <div className="poster-container">
            <img
              src={apiConfig.w500Image(item.poster_path)}
              alt=""
              style={{
                transform: isHovered
                  ? `scale(1.1) rotateY(${mousePosition.x * 0.02}deg) rotateX(${mousePosition.y * -0.02}deg)`
                  : 'scale(1) rotateY(0deg) rotateX(0deg)',
                filter: isHovered ? 'brightness(1.2) contrast(1.1)' : 'brightness(1) contrast(1)',
                boxShadow: isHovered
                  ? `0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.1)`
                  : '0 10px 30px rgba(0,0,0,0.3)'
              }}
            />
            <div className="poster-glow" style={{
              opacity: isHovered ? 0.6 : 0,
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
            }}></div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="floating-elements">
        <div className="floating-circle circle-1" style={{
          transform: isHovered ? `scale(1.5) translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)` : 'scale(1)',
          opacity: isHovered ? 0.3 : 0.1
        }}></div>
        <div className="floating-circle circle-2" style={{
          transform: isHovered ? `scale(1.3) translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)` : 'scale(1)',
          opacity: isHovered ? 0.2 : 0.05
        }}></div>
        <div className="floating-circle circle-3" style={{
          transform: isHovered ? `scale(1.8) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` : 'scale(1)',
          opacity: isHovered ? 0.4 : 0.15
        }}></div>
      </div>
    </div>
  );
};

const TrailerModal = (props) => {
  const item = props.item;

  const iframeRef = useRef(null);

  const onClose = () => iframeRef.current.setAttribute("src", "");

  return (
    <Modal active={false} id={`modal_${item.id}`}>
      <ModalContent onClose={onClose}>
        <iframe
          ref={iframeRef}
          width="100%"
          height="500px"
          title="trailer"
        ></iframe>
      </ModalContent>
    </Modal>
  );
};

export default HeroSlide;
