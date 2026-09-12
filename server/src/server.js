import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SERVER] Express API running on port ${PORT}`);
  console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[SERVER] Cloudinary status: http://localhost:${PORT}/api/cloudinary/status`);
});
