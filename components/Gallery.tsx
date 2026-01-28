'use client';

import React from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import ScrollReveal from './ScrollReveal'; // Import the reusable animator

const Gallery = () => {
  const images = [
    {
      original: '/images/gallery/classroom1.jpg',
      thumbnail: '/images/gallery/classroom1-thumb.jpg',
      description: 'Students engaged in classroom activities'
    },
    {
      original: '/images/gallery/outdoor1.jpg',
      thumbnail: '/images/gallery/outdoor1-thumb.jpg',
      description: 'Outdoor learning sessions'
    },
    {
      original: '/images/gallery/art1.jpg',
      thumbnail: '/images/gallery/art1-thumb.jpg',
      description: 'Student art exhibition'
    },
    {
      original: '/images/gallery/sports1.jpg',
      thumbnail: '/images/gallery/sports1-thumb.jpg',
      description: 'Annual sports day'
    },
    {
      original: '/images/gallery/graduation1.jpg',
      thumbnail: '/images/gallery/graduation1-thumb.jpg',
      description: 'Graduation ceremony'
    },
    {
      original: '/images/gallery/community1.jpg',
      thumbnail: '/images/gallery/community1-thumb.jpg',
      description: 'Community outreach program'
    }
  ];

  const renderItem = (item: any) => (
    <div className="relative">
      <img 
        src={item.original} 
        alt={item.description}
        className="w-full h-64 md:h-96 object-cover"
      />
      {item.description && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          {item.description}
        </div>
      )}
    </div>
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        {/* HEADER ANIMATION */}
        <div className="text-center mb-12">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Gallery</h2>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A glimpse into life at Papaya Academy
            </p>
          </ScrollReveal>
        </div>

        {/* MAIN SLIDER ANIMATION (Zoom In) */}
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="zoom-in" duration={800}>
            <ImageGallery
              items={images}
              renderItem={renderItem}
              showPlayButton={false}
              showFullscreenButton={true}
              showThumbnails={true}
              thumbnailPosition="bottom"
              additionalClass="gallery-container"
            />
          </ScrollReveal>
        </div>

        {/* THUMBNAIL GRID - Staggered Waterfall Effect */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <ScrollReveal 
              key={index} 
              animation="fade-up" 
              delay={index * 100} // 100ms delay between each image
            >
              <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
                <img 
                  src={image.original} 
                  alt={image.description}
                  className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .gallery-container .image-gallery-slide {
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .gallery-container .image-gallery-thumbnail {
          border-radius: 0.25rem;
          border: 2px solid transparent;
        }
        .gallery-container .image-gallery-thumbnail.active,
        .gallery-container .image-gallery-thumbnail:hover {
          border-color: #4CAF50;
        }
        .gallery-container .image-gallery-icon:hover {
          color: #4CAF50;
        }
      `}</style>
    </section>
  );
};

export default Gallery;