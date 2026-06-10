import React from "react";

interface HeroImagePreloaderProps {
  imageUrl: string;
}

export const HeroImagePreloader: React.FC<HeroImagePreloaderProps> = ({ imageUrl }) => {
  return (
    <>
      <link rel="preload" as="image" href={imageUrl} />
      <link rel="preload" as="image" href={imageUrl} imageSrcSet={imageUrl} />
    </>
  );
};
