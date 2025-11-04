// utils/mock-cloudinary.ts
export async function mockUploadToCloudinary(files: Express.Multer.File[]) {
  // Simulate upload delay
  await new Promise((res) => setTimeout(res, 200));
  // Return fake URLs
  return files.map(
    (file) => `https://mock.cloudinary.com/fake/${Date.now()}-${file.originalname}`
  );
}
