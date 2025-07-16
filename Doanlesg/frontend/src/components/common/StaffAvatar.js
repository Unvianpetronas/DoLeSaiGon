// StaffAvatar.js
import React, { useState, useEffect } from 'react';

// Read the cloud name securely from your .env file
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

/**
 * A component to display a staff member's avatar from Cloudinary.
 * It uses Cloudinary's versioning for robust cache-busting.
 * @param {string} employeeId - The public ID of the image on Cloudinary.
 * @param {string} alt - The alt text for the image.
 * @param {string} className - CSS class for styling.
 * @param {number} cacheKey - A timestamp used as the version number to force re-fetching the image.
 */
const StaffAvatar = ({ employeeId, alt, className, cacheKey }) => {
    const [imageError, setImageError] = useState(false);

    // When the employeeId or the cacheKey changes, reset the error state.
    useEffect(() => {
        setImageError(false);
    }, [employeeId, cacheKey]);

    if (!employeeId || !CLOUD_NAME || imageError) {
        return <span className={`no-image ${className || ''}`}>🚫</span>;
    }

    // ✅ FINAL FIX: Use the cacheKey as a version component in the URL path.
    // This is the most reliable way to invalidate the cache.
    // The URL format is: /upload/v<version>/<public_id>
    const imageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${cacheKey}/${employeeId}`;

    return (
        <img
            src={imageUrl}
            alt={alt || `Avatar for ${employeeId}`}
            className={className || ''}
            onError={() => setImageError(true)}
        />
    );
};

export default StaffAvatar;
