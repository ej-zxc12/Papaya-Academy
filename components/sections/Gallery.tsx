'use client';

import React, { useRef } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import ScrollReveal from '../ui/ScrollReveal';

const Gallery = () => {
  const galleryRef = useRef<ImageGallery>(null);

  const images = Array.from({ length: 14 }, (_, i) => ({
    original: `/images/gallery/glimpseofpapaya${i + 1}.jpg`,
    thumbnail: `/images/gallery/glimpseofpapaya${i + 1}.jpg`,
  }));

  const slideToIndex = (index: number) => {
    if (galleryRef.current) {
      galleryRef.current.slideToIndex(index);
    }
  };

  const renderItem = (item: any) => {
    const isFullscreen = typeof document !== 'undefined' && !!document.fullscreenElement;
    
    return (
      <div className={`relative w-full overflow-hidden ${isFullscreen ? 'h-screen' : 'h-80 md:h-[600px] rounded-2xl'}`}>
        <img 
          src={item.original} 
          alt="Gallery Image"
          className={`w-full h-full ${isFullscreen ? 'object-contain bg-black' : 'object-cover'}`}
        />
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-10">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-2">Our Life at Papaya</h2>
            <div className="w-16 h-1 bg-papaya-yellow mx-auto mb-4"></div>
          </ScrollReveal>
        </div>

        {/* MAIN CAROUSEL */}
        <div className="max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden bg-gray-50">
          <ScrollReveal animation="zoom-in">
            <ImageGallery
              ref={galleryRef}
              items={images}
              renderItem={renderItem}
              autoPlay={true}
              slideInterval={5000}
              slideDuration={800}
              showPlayButton={false}
              showFullscreenButton={true}
              showThumbnails={false}
              showBullets={false}
              additionalClass="fixed-gallery-carousel"
              useBrowserFullscreen={true}
            />
          </ScrollReveal>
        </div>

        {/* YOUR ADOPTED GRID CODE */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <ScrollReveal 
              key={index} 
              animation="fade-up" 
              delay={(index % 4) * 50} 
            >
              <div 
                onClick={() => slideToIndex(index)}
                className="group relative h-32 md:h-44 overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer"
              >
                <img 
                  src={image.original} 
                  alt={`Glimpse ${index + 1}`}
                  className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .image-gallery-content.fullscreen {
          background: #000;
        }
        .image-gallery-icon:hover {
          color: #ffcc00 !important;
        }
      `}</style>
    </section>
  );
};

export default Gallery;