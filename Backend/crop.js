import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '..', 'Frontend', 'public', 'clearlogo.png');
const outputPath = path.join(__dirname, '..', 'Frontend', 'public', 'clearlogo_cropped.png');

async function cropLogo() {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // The image is 1254x1254. Let's crop out a square from the top.
    // Circle diameter is likely around 800px.
    const cropSize = 850;
    const top = 50;
    const left = Math.floor((metadata.width - cropSize) / 2);

    await sharp(inputPath)
      .extract({ left: left, top: top, width: cropSize, height: cropSize })
      .toFile(outputPath);
      
    console.log("Cropped successfully to " + outputPath);
  } catch (error) {
    console.error(error);
  }
}
cropLogo();
