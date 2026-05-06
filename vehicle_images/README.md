# Vehicle Lifestyle Images

Drop lifestyle / press photos of each EV model here for the model pages.

## Folder structure

One folder per brand (using the brand slug), one image per model:

```
vehicle_images/
  tesla/
    model-y-long-range.jpg
    model-3-long-range.jpg
    model-s-long-range.jpg
    model-x-long-range.jpg
  bmw/
    i4.jpg
    i5.jpg
    ...
  volkswagen/
    id-3.jpg
    id-4.jpg
    ...
```

The site looks up each image at `/vehicle_images/[brand-slug]/[model-slug].jpg`.

## Format

- **JPG** preferred (smaller file size for photos)
- ~1600×900 (16:9) recommended for hero use
- Optimised for web (run through TinyPNG/Squoosh before upload)
- Brand-supplied press shots usually look best — clean studio or lifestyle setting

## Where to source

- Each manufacturer's UK press portal (most publish royalty-free press images for editorial / point-of-sale use)
- Your own delivery/install photography
- Stock libraries (Unsplash, Pexels) for generic charging scenes

## Fallback

If an image is missing, the site renders a clean styled placeholder (gradient + brand badge) — no broken images. The site looks great before any photos are dropped in; gets even better once they are.
