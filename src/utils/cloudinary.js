export const openCloudinaryWidget = (onSuccess) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!window.cloudinary) {
        console.error('Cloudinary library not loaded');
        return;
    }

    const widget = window.cloudinary.createUploadWidget(
        {
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            cropping: true,
            croppingAspectRatio: 1, // Garantizar imágenes cuadradas si se desea
            showSkipCropButton: false,
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
            maxFileSize: 2000000, // 2MB
            styles: {
                palette: {
                    window: '#FFFFFF',
                    windowBorder: '#9073C1',
                    tabIcon: '#7C3AED',
                    menuIcons: '#5A616A',
                    textDark: '#000000',
                    textLight: '#FFFFFF',
                    link: '#7C3AED',
                    action: '#7C3AED',
                    inactiveTabIcon: '#0E2F5A',
                    error: '#F44235',
                    inProgress: '#0078FF',
                    complete: '#20B832',
                    sourceBg: '#E4EBF1'
                }
            }
        },
        (error, result) => {
            if (!error && result && result.event === "success") {
                onSuccess(result.info.secure_url);
            }
        }
    );

    widget.open();
};
