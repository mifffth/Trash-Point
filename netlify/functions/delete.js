const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { publicId } = JSON.parse(event.body);

    if (!publicId) {
      return { statusCode: 400, body: 'Missing publicId in request body' };
    }

    console.log('Attempting to delete publicId:', publicId); 
    const result = await cloudinary.uploader.destroy(publicId);

    console.log('Cloudinary deletion result:', JSON.stringify(result, null, 2));

    if (result.result !== 'ok') {
      console.error('Cloudinary delete failed:', result); 
      throw new Error(`Cloudinary delete failed: ${result.result || 'Unknown error'}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Image deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting image:', error); 
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to delete image: ${error.message}` }),
    };
  }
};