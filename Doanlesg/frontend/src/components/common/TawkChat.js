import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TawkChat = () => {
    // Luôn gọi hook ở cấp cao nhất của component
    const location = useLocation();

    useEffect(() => {
        // Di chuyển logic điều kiện vào bên trong hook
        if (location.pathname.startsWith('/admin')) {
            // Nếu là trang admin, không làm gì cả và kết thúc effect.
            // Hàm cleanup bên dưới sẽ đảm bảo script được gỡ bỏ nếu có.
            return;
        }

        // Nếu không phải trang admin, thêm script vào trang
        const script = document.createElement("script");
        script.id = 'tawk-script'; // Thêm ID để dễ dàng tìm và xóa
        script.async = true;
        script.src = 'https://embed.tawk.to/6878cbddb3c1de190eea141f/1j0c01qem';
        script.setAttribute('crossorigin', '*');

        document.body.appendChild(script);

        // Hàm cleanup sẽ chạy khi component unmount hoặc khi effect chạy lại
        return () => {
            const existingScript = document.getElementById('tawk-script');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, [location.pathname]); // Dependency array để effect chạy lại khi URL thay đổi

    return null; // Component này không render ra giao diện
};

export default TawkChat;