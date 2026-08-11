"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import SubCategorySidebar from "./SubCategorySidebar";
import { usePathname, useSearchParams } from "next/navigation";
export default function MobileSideMenu(
  {selectedCategory,
  selectedSubCategory}) {
  const [open, setOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkMobile();

  window.addEventListener("resize", checkMobile);

  return () => {
    window.removeEventListener("resize", checkMobile);
  };
}, []);
 if(!isMobile) return<></>;
 
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
      
          display: "flex",
          alignItems: "center",
          gap: "8px",
      
          padding: "12px 20px",
          border: "none",
          borderRadius: "30px",
      
          background: "#E51B2A",
          color: "#fff",
      
          fontWeight: "700",
          cursor: "pointer",
      
          animation: "filterPulse 1.8s infinite",
        }}
      >
        <style jsx>{`
  @keyframes filterPulse {
    0% {
      transform: translateX(-50%) scale(1);
      box-shadow: 0 0 0 0 rgba(229, 27, 42, 0.55);
    }

    50% {
      transform: translateX(-50%) scale(1.05);
      box-shadow: 0 0 0 10px rgba(229, 27, 42, 0.12);
    }

    100% {
      transform: translateX(-50%) scale(1);
      box-shadow: 0 0 0 16px rgba(229, 27, 42, 0);
    }
  }
`}</style>
        <SlidersHorizontal size={18} />
        Filters
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 2000,
         
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "85%",
              maxWidth: "320px",
              height: "100%",
            
              background: "var(--surface)",
              color: "var(--ink)",
              borderRight: "1px solid var(--line)",
            
              padding: "20px",
              overflowY: "auto",
              boxShadow: "4px 0 20px rgba(0,0,0,0.2)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                marginLeft: "auto",
                display: "block",
                background: "var(--surface)",
                color: "var(--ink)",
                border: "1px solid var(--line)",
              }}
            >
              ×
            </button>

            <SubCategorySidebar 
             selectedCategory={selectedCategory}
             selectedSubCategory={selectedSubCategory}
            />
          </div>
        </div>
      )}
    </>
  );
}