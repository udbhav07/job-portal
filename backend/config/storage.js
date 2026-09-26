const {S3Client} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();
const REQUIRED = ["B2_ENDPOINT", "B2_REGION", "B2_BUCKET", "B2_KEY_ID", "B2_APP_KEY"];
const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing Backblaze B2 settings in .env: ${missing.join(", ")}`);
}



const s3 = new S3Client(
    {
        endpoint: process.env.B2_ENDPOINT,
        region : process.env.B2_REGION,
        credentials : {
            accessKeyId : process.env.B2_KEY_ID,
            secretAccessKey : process.env.B2_APP_KEY,
        },
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
    }
)

const BUCKET = process.env.B2_BUCKET;

// const {ListObjectsV2Command}=require('@aws-sdk/client-s3');
// s3.send(new ListObjectsV2Command({Bucket:BUCKET,MaxKeys:1})).then(r=>console.log('Connected to', BUCKET, '- files:', r.KeyCount)).catch(e=>console.error('Failed:', e.name, e.message));


module.exports = {s3,BUCKET};