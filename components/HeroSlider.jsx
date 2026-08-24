"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from 'next/image'

const slides = [
  {
    kicker: "CUSTOM MANUFACTURING • SIALKOT, PAKISTAN",
    titleLineOne: "BUILT FOR",
titleLineTwo: "YOUR BRAND",
    description:
      "MADX Sports manufactures private-label boxing, MMA, fitness and performance apparel—from product development and sampling to bulk production and export-ready packaging.",
    image:
      "/images/slider/slide1.png",
  },
  {
    kicker: "OEM • PRIVATE LABEL • CUSTOM DEVELOPMENT",
    titleLineOne: "YOUR DESIGN",
    titleLineTwo: "YOUR IDENTITY",
    description:
      "Develop custom materials, colors, artwork, sizing, labels and packaging around your market position and product requirements.",
      image:
      "/images/slider/slide2.png",
     },
  {
    kicker: "PRODUCTION • QUALITY CONTROL • EXPORT PACKING",
    titleLineOne: "FROM SAMPLE",
    titleLineTwo: "TO SHIPMENT",
    description:
      "A structured workflow keeps approvals, bulk manufacturing, quality inspection and retail-ready packing clear from start to finish.",
    image:
    "/images/slider/slide3.png",  },
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
        {slides?.map((slide, index) => (
          <article
            key={`${slide.titleLineOne}-${slide.titleLineTwo}`}
            className={`heroSlide ${
              activeSlide === index ? "active" : ""
            }`}
            aria-hidden={activeSlide !== index}
          >
           <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              sizes="100vw"
              quality={76}
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
          {slides?.map((slide, index) => (
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
