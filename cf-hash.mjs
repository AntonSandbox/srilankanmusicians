import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const accountId = envVars.CLOUDFLARE_ACCOUNT_ID;
const apiToken = envVars.CLOUDFLARE_API_TOKEN;

async function getAccountHash() {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    const data = await res.json();
    if (data.success && data.result.images.length > 0) {
      // images[0] should have id and variants
      const img = data.result.images[0];
      console.log('Image details:', img);
      
      // We can extract the account hash from the variant URL
      if (img.variants && img.variants.length > 0) {
        const url = img.variants[0];
        console.log('Variant URL:', url);
        // e.g. https://imagedelivery.net/W_ABcDefgHijKlmnOpQ/image_id/variant
        const match = url.match(/imagedelivery\.net\/([^\/]+)\//);
        if (match) {
          console.log('ACCOUNT_HASH is:', match[1]);
        }
      }
    } else {
      console.log('No images found or request failed', data);
    }
  } catch(e) {
    console.error(e);
  }
}

getAccountHash();
