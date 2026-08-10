"use client";

import { useRef, useState } from "react";
import { jsPDF } from "jspdf";

const MAX_IMAGES = 6;

export default function ImagePdfPage() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []).slice(0, MAX_IMAGES);

    const newImages = files.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      file,
      url: URL.createObjectURL(file),

      // physical printed size
      width: 6,
      height: 8,
    }));

    setImages(newImages);
  };

  const updateImage = (id, field, value) => {
    setImages((prev) =>
      prev.map((image) =>
        image.id === id
          ? {
              ...image,
              [field]: Number(value),
            }
          : image
      )
    );
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.url);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;

      img.src = src;
    });
  };

  const exportPdf = async () => {
    if (!images.length) {
      alert("Please upload images first.");
      return;
    }

    let pdf = null;

    for (let i = 0; i < images.length; i++) {
      const item = images[i];

      const width = Number(item.width);
      const height = Number(item.height);

      if (!width || !height) {
        alert("Width and height must be greater than 0.");
        return;
      }

      const img = await loadImage(item.url);

      /*
        PDF page is exactly the physical size
        selected by the user.

        Example:
        width = 6 inches
        height = 8 inches

        PDF page = 6" × 8"
      */

      if (i === 0) {
        pdf = new jsPDF({
          orientation: width > height ? "landscape" : "portrait",
          unit: "in",
          format: [width, height],
          compress: true,
        });
      } else {
        pdf.addPage(
          [width, height],
          width > height ? "landscape" : "portrait"
        );
      }

      pdf.addImage(
        img,
        "JPEG",
        0,
        0,
        width,
        height,
        undefined,
        "FAST"
      );
    }

    pdf.save("image-patterns.pdf");
  };

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          marginBottom: "8px",
          color: "#172d51",
        }}
      >
        Image Pattern PDF Maker
      </h1>

      <p
        style={{
          color: "#64748b",
          marginBottom: "25px",
        }}
      >
        Upload up to 6 images, set their exact size in inches and export them
        as PDF pages.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{
          marginBottom: "25px",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            style={{
              border: "1px solid #dce3ec",
              borderRadius: "12px",
              padding: "15px",
              background: "#fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                marginBottom: "10px",
                color: "#172d51",
              }}
            >
              Image {index + 1}
            </div>

            <div
              style={{
                height: "220px",
                background: "#f6f8fb",
                borderRadius: "8px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <img
                src={image.url}
                alt=""
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <label>
                <div
                  style={{
                    fontSize: "13px",
                    marginBottom: "5px",
                  }}
                >
                  Width (inches)
                </div>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={image.width}
                  onChange={(e) =>
                    updateImage(image.id, "width", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccd5e1",
                    borderRadius: "7px",
                  }}
                />
              </label>

              <label>
                <div
                  style={{
                    fontSize: "13px",
                    marginBottom: "5px",
                  }}
                >
                  Height (inches)
                </div>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={image.height}
                  onChange={(e) =>
                    updateImage(image.id, "height", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccd5e1",
                    borderRadius: "7px",
                  }}
                />
              </label>
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "10px",
                background: "#f7f9fc",
                borderRadius: "7px",
                fontSize: "13px",
              }}
            >
              PDF size:{" "}
              <strong>
                {image.width}" × {image.height}"
              </strong>
            </div>

            <button
              onClick={() => removeImage(image.id)}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "9px",
                border: "1px solid #dc2626",
                background: "white",
                color: "#dc2626",
                borderRadius: "7px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <button
          onClick={exportPdf}
          style={{
            marginTop: "30px",
            padding: "13px 24px",
            border: "none",
            borderRadius: "8px",
            background: "#172d51",
            color: "white",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Export PDF
        </button>
      )}
    </main>
  );
}