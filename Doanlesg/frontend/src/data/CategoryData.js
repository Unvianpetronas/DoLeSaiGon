// ====================================================================================
// CATEGORY DATA CONFIGURATION
// ------------------------------------------------------------------------------------
// Mục đích: Cấu hình toàn bộ hệ thống danh mục – subcategory dùng cho:
//   1. Menu 3 cấp (CategoryMenu)
//   2. Lọc /products và /category/:slug (Products page)
//   3. Nhận diện tên subcategory từ productName (getSubCategoryName)
// ====================================================================================

/**
 * ❶ CategoryData
 * - Danh sách danh mục chính (cấp 1), mỗi mục có:
 *    • name: tên tiếng Việt hiển thị.
 *    • slug: đoạn URL (dạng không dấu).
 *    • subcategories: mảng con cấp 2 (có thể chứa cấp 3 trong items[]).
 */
export const CategoryData = [
  {
    name: 'Mâm Hoa Quả',
    slug: 'mam-hoa-qua',
    subcategories: [
      { name: 'Mâm Quả' },
      { name: 'Tháp Quả' },
      { name: 'Mâm Phật Thủ' },
    ],
  },
  {
    name: 'Mâm Bánh',
    slug: 'mam-banh',
    subcategories: [
      { name: 'Mâm Bánh Ngọt' },
      {
        name: 'Mâm Bánh Truyền Thống',
        items: ['Bánh Xu Xê', 'Bánh Cốm', 'Bánh Bao'], // chỉ dùng để hiển thị menu
      }
    ],
  },
  {
    name: 'Mâm Cúng Lễ',
    slug: 'mam-cung-le',
    subcategories: [
      { name: 'Mâm Cúng Thần Tài' },
      { name: 'Mâm Cúng Gia Tiên' },
      { name: 'Mâm Cúng Tất Niên' },
      { name: 'Mâm Cúng Động Thổ' },
      { name: 'Mâm Cúng Khai Trương' },
      { name: 'Mâm Cúng Rằm, Mùng 1' },
      { name: 'Mâm Cúng Thôi Nôi' },
    ],
  },
  {
    name: 'Quà Tặng Cao Cấp',
    slug: 'hop-qua-tang',
    subcategories: [
      {
        name: 'Bộ quà Bốn Mùa',
        items: ['Mùa xuân', 'Mùa hạ', 'Mùa thu', 'Mùa đông'],
      },
      {
        name: 'Bộ quà tặng cao cấp',
        items: ['Bộ quà thịnh vượng', 'Bộ quà tài lộc', 'Bộ quà hạnh phúc'],
      },
      {
        name: 'Bộ quà sức khỏe',
        items: ['Dinh dưỡng tự nhiên', 'Yến sào', 'Nhân sâm'],
      },
      {
        name: 'Quà Biếu Vip',
        items: ['Hộp Quà Cao Cấp', 'Giỏ Quà Vip'],
      },
      {
        name: 'Quà Tặng Doanh Nghiệp',
        items: ['Combo Quà Tết', 'Hộp Quà Công Ty'],
      },
    ],
  },
  {
    name: 'Mâm Chay,Mặn',
    slug: 'mam-chay-man',
    subcategories: [
      {
        name: 'Mâm Chay',
        items: ['Mâm Bánh Trôi Chay', 'Mâm Cúng Chay'],
      },
      {
        name: 'Mâm Mặn',
        items: ['Heo Quay', 'Xôi-Gà', 'Mâm Cúng Mặn'],
      },
    ],
  },
];

/**
 * ❷ keywordMap
 * - Map từ tên subcategory ➜ slug danh mục cha
 * - Dùng để hỗ trợ lọc khi biết tên subcategory mà chưa biết slug
 */
export const keywordMap = {
  'Mâm Hoa Quả': 'mam-hoa-qua',
  'Tháp Quả': 'mam-hoa-qua',
  'Mâm Quả': 'mam-hoa-qua',
  'Mâm Phật Thủ': 'mam-hoa-qua',

  'Mâm Bánh': 'mam-banh',
  'Mâm Bánh Ngọt': 'mam-banh',
  'Mâm Bánh Truyền Thống': 'mam-banh',
  'Tháp Oản': 'mam-banh',

  'Mâm Cúng': 'mam-cung',
  'Mâm Cúng Thần Tài': 'mam-cung-le',
  'Mâm Cúng Gia Tiên': 'mam-cung-le',
  'Mâm Cúng Tất Niên': 'mam-cung-le',
  'Mâm Cúng Động Thổ': 'mam-cung-le',
  'Mâm Cúng Khai Trương': 'mam-cung-le',
  'Mâm Cúng Rằm, Mùng 1': 'mam-cung-le',
  'Mâm Cúng Thôi Nôi': 'mam-cung-le',

  'Quà Tặng': 'hop-qua-tang',
  'Bộ quà Bốn Mùa': 'hop-qua-tang',
  'Bộ quà tặng cao cấp': 'hop-qua-tang',
  'Bộ quà sức khỏe': 'hop-qua-tang',
  'Quà Biếu Vip': 'hop-qua-tang',
  'Quà Tặng Doanh Nghiệp': 'hop-qua-tang',

  'Mâm Chay / Mặn': 'mam-chay-man',
  'Mâm Chay': 'mam-chay-man',
  'Mâm Mặn': 'mam-chay-man',
};

/**
 * ❸ subCategoryMap
 * - Map từ slug danh mục cấp 1 ➜ mảng tên subcategory cấp 2
 * - Dùng để render tab subcategory trong /category/:slug hoặc lọc sản phẩm
 */
export const subCategoryMap = {
  'mam-hoa-qua': ['Mâm Quả', 'Tháp Quả', 'Mâm Phật Thủ'],
  'mam-banh': ['Mâm Bánh Ngọt', 'Mâm Bánh Truyền Thống'],
  'mam-cung-le': [
    'Mâm Cúng Thần Tài',
    'Mâm Cúng Gia Tiên',
    'Mâm Cúng Tất Niên',
    'Mâm Cúng Động Thổ',
    'Mâm Cúng Khai Trương',
    'Mâm Cúng Rằm, Mùng 1',
    'Mâm Cúng Thôi Nôi',
  ],
  'hop-qua-tang': [
    'Bộ quà Bốn Mùa',
    'Bộ quà tặng cao cấp',
    'Bộ quà sức khỏe',
    'Quà Biếu Vip',
    'Quà Tặng Doanh Nghiệp',
  ],
  'mam-chay-man': ['Mâm Chay', 'Mâm Mặn'],
};

/**
 * ❹ getSubCategoryName(product, categorySlug?)
 * - Phân tích tên sản phẩm để xác định subcategory phù hợp
 * - Ưu tiên lọc theo categorySlug nếu được truyền vào để tăng độ chính xác
 */
export const getSubCategoryName = (product, categorySlug = '') => {
  const name = product.productName?.toLowerCase() || '';

  // ==== Khi biết categorySlug: dò chính xác subcategory thuộc danh mục đó ====
  if (categorySlug) {
    let result = '';

    switch (categorySlug) {
      case 'mam-hoa-qua':
        if (name.includes('phật thủ')) result = 'Mâm Phật Thủ';
        else if (name.includes('tháp')) result = 'Tháp Quả';
        else if (name.includes('quả')) result = 'Mâm Quả';
        break;

      case 'mam-banh':
        if (name.includes('truyền thống') || name.includes('cốm') || name.includes('xu xê') || name.includes('bao')) {
          result = 'Mâm Bánh Truyền Thống';
        } else if (name.includes('oản')) {
          result = 'Tháp Oản';
        } else if (name.includes('bánh') || name.includes('ngọt')) {
          result = 'Mâm Bánh Ngọt';
        }
        break;

      case 'mam-cung-le':
        if (name.includes('thần tài')) result = 'Mâm Cúng Thần Tài';
        else if (name.includes('gia tiên') || name.includes('tổ tiên')) result = 'Mâm Cúng Gia Tiên';
        else if (name.includes('tất niên')) result = 'Mâm Cúng Tất Niên';
        else if (name.includes('động thổ')) result = 'Mâm Cúng Động Thổ';
        else if (name.includes('khai trương')) result = 'Mâm Cúng Khai Trương';
        else if (name.includes('rằm') || name.includes('mùng 1')) result = 'Mâm Cúng Rằm, Mùng 1';
        else if (name.includes('thôi nôi')) result = 'Mâm Cúng Thôi Nôi';
        break;

      case 'hop-qua-tang':
        if (name.includes('bốn mùa') || name.includes('xuân') || name.includes('hạ') || name.includes('thu') || name.includes('đông')) {
          result = 'Bộ quà Bốn Mùa';
        } else if (name.includes('thịnh vượng') || name.includes('tài lộc') || name.includes('hạnh phúc')) {
          result = 'Bộ quà tặng cao cấp';
        } else if (name.includes('sức khỏe') || name.includes('yến') || name.includes('sâm') || name.includes('dinh dưỡng')) {
          result = 'Bộ quà sức khỏe';
        } else if (name.includes('vip') || name.includes('giỏ')) {
          result = 'Quà Biếu Vip';
        } else if (name.includes('combo') || name.includes('doanh nghiệp') || name.includes('công ty')) {
          result = 'Quà Tặng Doanh Nghiệp';
        }
        break;

      case 'mam-chay-man':
        if (name.includes('chay')) result = 'Mâm Chay';
        else if (name.includes('heo') || name.includes('mặn') || name.includes('xôi') || name.includes('gà')) {
          result = 'Mâm Mặn';
        }
        break;

      default:
        break;
    }

    // ✅ Chỉ return nếu khớp subcategory thật sự
    if (result && subCategoryMap[categorySlug]?.includes(result)) {
      return result;
    }

    return 'Khác';
  }

  // ==== Fallback khi không có slug: dò đoán chung ====
  if (name.includes('phật thủ')) return 'Mâm Phật Thủ';
  if (name.includes('tháp') && name.includes('quả')) return 'Tháp Quả';
  if (name.includes('quả') || name.includes('trái cây')) return 'Mâm Quả';

  if (name.includes('bánh') || name.includes('ngọt') || name.includes('oản')) {
    if (name.includes('truyền thống') || name.includes('cốm') || name.includes('xu xê') || name.includes('bao')) {
      return 'Mâm Bánh Truyền Thống';
    }
    if (name.includes('oản')) return 'Tháp Oản';
    return 'Mâm Bánh Ngọt';
  }

  if (name.includes('cúng')) {
    if (name.includes('thần tài')) return 'Mâm Cúng Thần Tài';
    if (name.includes('gia tiên') || name.includes('tổ tiên')) return 'Mâm Cúng Gia Tiên';
    if (name.includes('tất niên')) return 'Mâm Cúng Tất Niên';
    if (name.includes('động thổ')) return 'Mâm Cúng Động Thổ';
    if (name.includes('khai trương')) return 'Mâm Cúng Khai Trương';
    if (name.includes('rằm') || name.includes('mùng 1')) return 'Mâm Cúng Rằm, Mùng 1';
    if (name.includes('thôi nôi')) return 'Mâm Cúng Thôi Nôi';
  }

  if (name.includes('bốn mùa') || name.includes('xuân') || name.includes('hạ') || name.includes('thu') || name.includes('đông')) {
    return 'Bộ quà Bốn Mùa';
  }

  if (name.includes('thịnh vượng') || name.includes('tài lộc') || name.includes('hạnh phúc')) {
    return 'Bộ quà tặng cao cấp';
  }

  if (name.includes('sức khỏe') || name.includes('yến') || name.includes('sâm') || name.includes('dinh dưỡng')) {
    return 'Bộ quà sức khỏe';
  }

  if (name.includes('vip') || name.includes('giỏ')) return 'Quà Biếu Vip';
  if (name.includes('combo') || name.includes('doanh nghiệp') || name.includes('công ty')) return 'Quà Tặng Doanh Nghiệp';

  if (name.includes('chay')) return 'Mâm Chay';
  if (name.includes('heo') || name.includes('mặn') || name.includes('xôi') || name.includes('gà')) return 'Mâm Mặn';

  return 'Khác';
};

