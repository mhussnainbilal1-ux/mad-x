"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    kicker: "SIALKOT • PAKISTAN • GLOBAL EXPORT",
    titleLineOne: "FROM SKETCH",
titleLineTwo: "TO SHELF",
    description:
      "OEM and private-label MMA, boxing, BJJ and fitness products engineered, sampled, manufactured and packed for ambitious combat sports brands.",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=2000&q=90",
  },
  {
    kicker: "OEM • PRIVATE LABEL • CUSTOM DEVELOPMENT",
    titleLineOne: "FROM DESIGN",
    titleLineTwo: "TO DELIVERY",
    description:
      "We help combat sports brands develop custom materials, colors, logos, sizing, packaging and performance specifications.",
    image:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2000&q=90",
  },
  {
    kicker: "BOXING • MMA • BJJ • FITNESS",
    titleLineOne: "YOUR VISION",
    titleLineTwo: "OUR FACTORY",
    description:
      "Reliable manufacturing, quality control and export-ready packaging for growing brands, gyms, distributors and retailers.",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=2000&q=90",
  },
];

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }

    const interval = setInterval(() => {
      setActiveSlide((current) =>
        current === slides.length - 1 ? 0 : current + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [paused]);

  const previousSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section
      className="heroSlider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured manufacturing services"
    >
      <div className="heroSlides">
        {slides.map((slide, index) => (
          <article
            key={`${slide.titleLineOne}-${slide.titleLineTwo}`}
            className={`heroSlide ${
              activeSlide === index ? "active" : ""
            }`}
            aria-hidden={activeSlide !== index}
          >
            <img
              src={slide.image}
              alt=""
              className="heroSlideImage"
            />

            <div className="heroSlideOverlay" />

            <div
      className="shell heroCopy"
      style={{ marginLeft: isMobile ? "-10px" : "100px" }}
    >
      <span className="kicker">{slide.kicker}</span>

      <h1>
        {slide.titleLineOne}
        <br />
        {slide.titleLineTwo}
      </h1>

      <p>{slide.description}</p>

      <div className="heroActions">
        <Link className="button red" href="/quote">
          Request a Quote
        </Link>

        <Link className="button ghost" href="/products">
          Explore Products
        </Link>
      </div>
    </div>
          </article>
        ))}
      </div>

      <div className="shell heroSliderControls">
        <div className="heroSliderArrows">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            ←
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            →
          </button>
        </div>

        <div
          className="heroSliderDots"
          aria-label="Choose hero slide"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.titleLineOne}
              type="button"
              className={activeSlide === index ? "active" : ""}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
            >
              <span />
            </button>
          ))}
        </div>

        <div className="heroSliderCounter">
          <strong>{String(activeSlide + 1).padStart(2, "0")}</strong>
          <span>/</span>
          <span>{String(slides.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div
        key={activeSlide}
        className="heroSliderProgress"
        aria-hidden="true"
      />
    </section>
  );
}

