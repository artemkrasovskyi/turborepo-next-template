import type { PostImage } from '@repo/types/features/posts';

type PostImageGridProps = {
  images: PostImage[];
};

export function PostImageGrid({ images }: PostImageGridProps) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg">
        <img
          src={images[0]!.url}
          alt=""
          className="max-h-96 w-full object-cover"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {images.map((image) => (
          <img key={image.id} src={image.url} alt="" className="h-48 w-full object-cover" />
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        <img
          src={images[0]!.url}
          alt=""
          className="row-span-2 h-full w-full object-cover"
          style={{ minHeight: '12rem' }}
        />
        <img src={images[1]!.url} alt="" className="h-24 w-full object-cover" />
        <img src={images[2]!.url} alt="" className="h-24 w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
      {images.slice(0, 4).map((image) => (
        <img key={image.id} src={image.url} alt="" className="h-36 w-full object-cover" />
      ))}
    </div>
  );
}
