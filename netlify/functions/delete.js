import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  try {
    const { public_id } = JSON.parse(event.body);

    if (!public_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing public_id' }),
      };
    }

    const result = await cloudinary.uploader.destroy(public_id);

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete from Cloudinary' }),
    };
  }
};
