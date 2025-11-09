import { useState } from "react";
import { useProducts } from "@/contexts/ProductsContextMySQL";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const VideoAdvertisement = () => {
  const { videos } = useProducts();
  const [isClosed, setIsClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeVideos = videos.filter(v => v.active);

  if (isClosed || activeVideos.length === 0) return null;

  const currentVideo = activeVideos[currentIndex];

  return (
    <div className="relative w-full bg-gradient-hero rounded-2xl overflow-hidden mb-6">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-20 text-white hover:bg-white/20"
        onClick={() => setIsClosed(true)}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Video Display */}
      <div className="relative w-full aspect-video">
        {currentVideo.type === "youtube" || currentVideo.type === "vimeo" ? (
          <iframe
            src={currentVideo.url}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={currentVideo.url}
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            loop
          />
        )}
        {currentVideo.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-semibold">{currentVideo.title}</h3>
          </div>
        )}
      </div>

      {/* Navigation Dots */}
      {activeVideos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activeVideos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoAdvertisement;

