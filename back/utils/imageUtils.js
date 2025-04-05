const sharp = require('sharp');
const crypto = require('crypto');
const { S3, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const awsConfig = require('../s3.json');

const s3 = new S3(awsConfig);

/**
 * 이미지 파일을 리사이즈하고 S3에 업로드하는 함수
 * @param {object} file - Multer가 제공하는 파일 객체
 * @returns {string} 업로드된 파일 경로
 */
const resizeAndUploadImage = async (file) => {
    try {
        const encodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const newRandomName = crypto.randomBytes(16).toString('hex');
        let newFilePath = `${newRandomName}_${encodedOriginalName}`;
        let outputBuffer = file.buffer;
        const extension = file.originalname.split('.').pop().toLowerCase();
        let contentType = `image/${extension}`

        const { width } = await sharp(outputBuffer).metadata();
        if (extension === "gif") {
            newFilePath = newFilePath.replace(`.${extension}`, '.webp');
            outputBuffer = await sharp(outputBuffer, { animated: true })
                .webp({ quality: 80 })
                .withMetadata(false)
                .toBuffer()
            contentType = 'image/webp';
        } else if (width > 500) {
            newFilePath = newFilePath.replace(`.${extension}`, '.webp');
            outputBuffer = await sharp(outputBuffer)
                .resize({ width: 800 })
                .webp({ quality: 80 })
                .withMetadata(false)
                .toBuffer();
            contentType = 'image/webp';
        }

        await s3.send(new PutObjectCommand({
            Bucket: 'welog-seoul',
            Key: newFilePath,
            Body: outputBuffer,
            ContentType: contentType,
            ACL: 'public-read'
        }));

        return newFilePath;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/**
 * S3에서 이미지를 삭제하는 함수
 * @param {string} filePath - 삭제할 파일 경로
 * @returns {Promise} 삭제 결과
 */
const deleteImage = async (filePath) => {
    try {
        return await s3.send(new DeleteObjectCommand({
            Bucket: 'welog-seoul',
            Key: filePath
        }));
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports = {
    resizeAndUploadImage,
    deleteImage,
    s3
}; 