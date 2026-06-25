import { createUploadthing, type FileRouter } from 'uploadthing/next';

const uploader = createUploadthing();

export const ourFileRouter = {
  imageUploader: uploader({ image: { maxFileSize: '4MB', maxFileCount: 4 } }).onUploadComplete(
    ({ file }) => ({ url: file.ufsUrl }),
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
