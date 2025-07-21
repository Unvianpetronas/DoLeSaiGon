const GHN_API_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = "efd1f810-662a-11f0-9b81-222185cb68c8"; // Thay Token của bạn vào đây

const fetchGhnApi = async (endpoint, options = {}) => {
    const response = await fetch(`${GHN_API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'Token': GHN_TOKEN,
        },
    });
    if (!response.ok) {
        throw new Error(`GHN API call failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data; // GHN API trả về dữ liệu trong thuộc tính 'data'
};

export const getProvinces = () => fetchGhnApi('/master-data/province');

export const getDistricts = (provinceId) => fetchGhnApi(`/master-data/district?province_id=${provinceId}`);

export const getWards = (districtId) => fetchGhnApi(`/master-data/ward?district_id=${districtId}`);