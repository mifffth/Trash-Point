const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.handler = async (event) => {
  try {
    console.log("Event body received:", event.body);

    const { public_id } = JSON.parse(event.body);

    if (!public_id) {
      console.error("Missing public_id in request body.");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing public_id' }),
      };
    }

    console.log("Attempting to delete public_id:", public_id);

    const result = await cloudinary.uploader.destroy(public_id);

    console.log("Cloudinary destroy result:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete from Cloudinary', details: error.message }),
    };
  }
};

