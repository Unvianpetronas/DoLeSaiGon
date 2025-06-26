export const CategoryData = [
  {
    name: 'Mâm Hoa Quả',
    slug: 'mam-hoa-qua',
    subcategories: [
      { name: 'Mâm quả' },
      { name: 'Tháp quả' },
      { name: 'Mâm phật thủ' },
    ],
    products: [
      { id: 1, name: 'Mâm ngũ quả', image: '/images/AnNhienPhuQuy.png', price: 1200000, discount: 'Giảm 5%' },
      { id: 2, name: 'Mâm tam sắc', image: '/images/BoQuaThinhVuong.png', price: 1500000 },
    ],
  },
  {
    name: 'Mâm Cúng Lễ',
    slug: 'mam-cung-le',
    subcategories: [
      { name: 'Mâm thần tài' },
      { name: 'Mâm tất niên' },
      { name: 'Mâm cúng động thổ' },
      { name: 'Mâm cúng khai trương' },
      { name: 'Mâm cúng rằm, mùng 1' },
      { name: 'Mâm cúng thôi nôi, đầy tháng' },
      { name: 'Mâm tết đoan ngọ' },
    ],
    products: [
      { id: 3, name: 'Mâm lễ rằm', image: '/images/ChieuTaiDonLoc.png', price: 980000 },
      { id: 4, name: 'Mâm lễ khai trương', image: '/images/LongQuyTuPhuc.png', price: 1600000 },
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
    ],
    products: [
      { id: 5, name: 'Quà biếu sức khỏe', image: '/images/BoQuaBonMua.png', price: 2300000, discount: 'Giảm 10%' },
      { id: 6, name: 'Giỏ quà sang trọng', image: '/images/BoQuaLocPhat.png', price: 2800000 },
    ],
  },
  {
    name: 'Mâm Bánh',
    slug: 'mam-banh',
    subcategories: [
      { name: 'Mâm bánh kẹo' },
      { name: 'Mâm bánh bao' },
      { name: 'Mâm bánh xu xê, bánh cốm' },
      { name: 'Tháp oản' },
    ],
    products: [
      { id: 7, name: 'Mâm bánh trung thu', image: '/images/BoQuaTaiLoc.png', price: 750000 },
      { id: 8, name: 'Bánh ngọt truyền thống', image: '/images/HungThinhPhatTai.png', price: 520000 },
    ],
  },
  {
    name: 'Mâm Chay, Mặn',
    slug: 'mam-chay-man',
    subcategories: [
      {
        name: 'Mâm chay',
        items: ['Mâm bánh trôi chay'],
      },
      {
        name: 'Mâm mặn',
        items: ['Heo quay', 'Xôi', 'Xôi-Gà', 'Mâm cúng mặn'],
      },
    ],
    products: [
      { id: 9, name: 'Mâm cúng chay', image: '/images/to_yen.png', price: 880000 },
      { id: 10, name: 'Mâm lễ mặn đầy đủ', image: '/images/Comhoasen.png', price: 1350000 },
    ],
  },
];
