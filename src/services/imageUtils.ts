
export const overlayLogo = (imageBase64: string, logoBase64: string, position: 'bottom-right' | 'top-right' | 'top-left' | 'bottom-left' = 'bottom-right'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        const image = new Image();
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw main image
            ctx.drawImage(image, 0, 0);

            const logo = new Image();
            logo.onload = () => {
                // Calculate logo size (e.g., 15% of image width)
                const targetWidth = image.width * 0.15;
                const aspectRatio = logo.width / logo.height;
                const targetHeight = targetWidth / aspectRatio;

                // Calculate position
                let x = 0;
                let y = 0;
                const padding = image.width * 0.03; // 3% padding

                switch (position) {
                    case 'bottom-right':
                        x = canvas.width - targetWidth - padding;
                        y = canvas.height - targetHeight - padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = canvas.height - targetHeight - padding;
                        break;
                    case 'top-right':
                        x = canvas.width - targetWidth - padding;
                        y = padding;
                        break;
                    case 'top-left':
                        x = padding;
                        y = padding;
                        break;
                }

                // Draw logo
                ctx.globalAlpha = 0.9; // Slight transparency
                ctx.drawImage(logo, x, y, targetWidth, targetHeight);

                // Return result
                resolve(canvas.toDataURL('image/png'));
            };
            logo.onerror = (err) => reject(new Error('Failed to load logo image'));
            logo.src = logoBase64;
        };
        image.onerror = (err) => reject(new Error('Failed to load main image'));
        image.src = imageBase64;
    });
};
