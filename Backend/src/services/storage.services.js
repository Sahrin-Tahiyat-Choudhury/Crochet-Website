const {ImageKit} = require("@imagekit/nodejs")

const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,  
})

async function uploadFile(file) {
    const result = await ImageKitClient.files.upload({
        file,
        fileName:"image_" + Date.now(),
        folder:"yt-complete-backend/product-images" //in imagekit we've this folder in which we've product-images folder inside which all image files will be stored
    })

    return result;
}

module.exports = { uploadFile }

