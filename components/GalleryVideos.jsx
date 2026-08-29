import fs from "node:fs";
import path from "node:path";

const videoSlots = [
  {
    file: "video-1.mp4",
    title: "Inside MADX Sports manufacturing",
    description: "A closer look at our production process and workmanship.",
    poster: "/images/common/gallery/stitching-assembly.png",
  },
  {
    file: "video-2.mp4",
    title: "Product development in action",
    description: "From materials and construction to the finished product.",
    poster: "/images/common/gallery/product-development.png",
  },
  {
    file: "video-3.mp4",
    title: "Shin guard stitching",
    description:
      "Precision stitching and assembly during combat shin guard production.",
    poster: "/images/common/gallery/stitching-assembly.png",
  },
  {
    file: "video-4.mp4",
    title: "Performance shirt stitching",
    description:
      "A close look at precision stitching and assembly for performance shirts.",
    poster: "/images/common/gallery/performance-apparel.png",
  },
  {
    file: "video-5.mp4",
    title: "Skilled manufacturing process",
    description:
      "Behind-the-scenes craftsmanship during the product manufacturing process.",
    poster: "/images/common/gallery/material-cutting.png",
  },
  {
    file: "video-6.mp4",
    title: "Production craftsmanship",
    description:
      "A closer view of hands-on production work inside MAD X Sports.",
    poster: "/images/common/gallery/custom-branding.png",
  },
];

export default function GalleryVideos() {
  const videoDirectory = path.join(
    process.cwd(),
    "public",
    "videos",
    "gallery",
  );
  const availableVideos = videoSlots.filter(({ file }) =>
    fs.existsSync(path.join(videoDirectory, file)),
  );

  if (!availableVideos.length) return null;

  return (
    <section
      className="section galleryVideoSection"
      aria-labelledby="gallery-videos-title"
    >
      <div className="shell">
        <div className="galleryVideoHeading">
          <div>
            <span className="kicker dark">WATCH OUR WORK</span>
            <h2 id="gallery-videos-title">Manufacturing in motion</h2>
          </div>
          <p>
            Short behind-the-scenes views of product development, production,
            inspection and packing at MADX Sports.
          </p>
        </div>

        <div className="galleryVideoGrid">
          {availableVideos.map((video) => (
            <article className="galleryVideoCard" key={video.file}>
              <div className="galleryVideoPlayer">
                <video
                  controls
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                  poster={video.poster}
                  aria-label={video.title}
                >
                  <source
                    src={`/videos/gallery/${video.file}`}
                    type="video/mp4"
                  />
                  Your browser does not support embedded videos.
                </video>
                <span className="galleryVideoWatermark" aria-hidden="true">
                  MAD X SPORTS
                </span>
              </div>
              <div>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
