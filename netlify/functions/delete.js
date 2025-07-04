const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    console.log('[Delete Function] Body:', event.body);

    const { publicId } = JSON.parse(event.body);

    if (!publicId) {
      console.error('[Delete Function] Missing publicId');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing publicId' }),
      };
    }

    console.log('[Delete Function] Attempting to delete:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    console.log('[Delete Function] Cloudinary result:', result);

    if (result.result !== 'ok') {
      throw new Error(`Cloudinary delete failed: ${result.result}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Image deleted successfully' }),
    };
  } catch (error) {
    console.error('[Delete Function] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete image', error: error.message }),
    };
  }
};
