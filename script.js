document.addEventListener('DOMContentLoaded', function () {
  let originalImageData = null;
  let upscaledImageData = null;

  // Add event listener for the "Upscale Image" button
  document.getElementById('upscaleButton').addEventListener('click', processImage);

  // Add event listener for the "Create Flickering GIF" button
  document.getElementById('gifButton').addEventListener('click', createFlickeringGIF);

  function processImage() {
    const fileInput = document.getElementById('imageInput');
    const scaleFactor = parseInt(document.getElementById('scaleFactor').value, 10);
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');

    if (!fileInput.files[0]) {
      alert('Please upload an image.');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        console.log('Image loaded successfully.');

        // Set canvas size to upscaled dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;
        const upscaledWidth = originalWidth * scaleFactor;
        const upscaledHeight = originalHeight * scaleFactor;
        canvas.width = upscaledWidth;
        canvas.height = upscaledHeight;

        // Draw the original image on the canvas
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

        // Save the original image data
        originalImageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
        console.log('Original image data saved.');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Upscale the image using RGB dots
        for (let y = 0; y < originalHeight; y++) {
          for (let x = 0; x < originalWidth; x++) {
            const index = (y * originalWidth + x) * 4;
            const r = originalImageData.data[index];
            const g = originalImageData.data[index + 1];
            const b = originalImageData.data[index + 2];

            // Calculate the position for the upscaled image
            const upscaledX = x * scaleFactor;
            const upscaledY = y * scaleFactor;

            // Draw red, green, and blue dots
            ctx.fillStyle = `rgba(${r}, 0, 0, 255)`;
            ctx.fillRect(upscaledX, upscaledY, 1, 1); // Red dot

            ctx.fillStyle = `rgba(0, ${g}, 0, 255)`;
            ctx.fillRect(upscaledX + 1, upscaledY, 1, 1); // Green dot

            ctx.fillStyle = `rgba(0, 0, ${b}, 255)`;
            ctx.fillRect(upscaledX, upscaledY + 1, 1, 1); // Blue dot
          }
        }

        // Save the upscaled image data
        upscaledImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log('Upscaled image data saved.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function createFlickeringGIF() {
    if (!originalImageData || !upscaledImageData) {
      alert('Please process an image first.');
      return;
    }

    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');

    // Hide the canvas while the GIF is being generated
    canvas.style.display = 'none';

    // Create a GIF instance
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
    });

    console.log('GIF instance created.');

    // Add only two frames to the GIF
    for (let i = 0; i < 2; i++) {
      if (i % 2 === 0) {
        // Use the original image
        ctx.putImageData(originalImageData, 0, 0);
        console.log(`Frame ${i + 1}: Original image added.`);
      } else {
        // Use the RGB-dot version
        ctx.putImageData(upscaledImageData, 0, 0);
        console.log(`Frame ${i + 1}: Upscaled image added.`);
      }
      gif.addFrame(ctx, { copy: true, delay: 1 }); // 1ms delay for fast flickering
    }

    console.log('All frames added to GIF.');

    // Render the GIF
    gif.on('finished', function (blob) {
      console.log('GIF rendering finished.');

      const url = URL.createObjectURL(blob);
      console.log('GIF URL created:', url);

      // Create an image element for the GIF
      const gifImage = new Image();
      gifImage.src = url;
      gifImage.alt = 'Flickering GIF Output';
      gifImage.style.display = 'block';
      gifImage.style.marginTop = '20px';

      // Replace the canvas with the GIF
      const canvasContainer = canvas.parentElement;
      canvasContainer.appendChild(gifImage); // Append the GIF instead of replacing the canvas
      console.log('GIF appended to the page.');
    });

    gif.render();
    console.log('GIF rendering started.');
  }
});