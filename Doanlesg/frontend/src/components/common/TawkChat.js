import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TawkChat = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith('/admin')) {
            return;
        }

        // Nếu không phải trang admin, thêm script vào trang
        const script = document.createElement("script");
        script.id = 'tawk-script'; // Thêm ID để dễ dàng tìm và xóa
        script.async = true;
        script.src = 'https://embed.tawk.to/6878cbddb3c1de190eea141f/1j0c01qem';
        script.setAttribute('crossorigin', '*');

        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById('tawk-script');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, [location.pathname]);

    return null;
};

export default TawkChat;