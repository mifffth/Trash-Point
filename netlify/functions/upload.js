const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { photoBase64 } = JSON.parse(event.body);

    const result = await cloudinary.uploader.upload(photoBase64, {
      upload_preset: process.env.TRASH_POINTS_UPLOAD_PRESET,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        secureUrl: result.secure_url,
        publicId: result.public_id,
      }),
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to upload image', error: error.message }),
    };
  }
};