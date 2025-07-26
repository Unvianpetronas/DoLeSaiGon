// src/components/Policy/Instructions.js

import React from 'react';
import { useParams } from 'react-router-dom';
import './Policy.css';
import { Helmet } from 'react-helmet-async';

const instructionsData = {
  "huong-dan-mua-hang": {
    title: "Hướng dẫn mua hàng",
    content: (
      <>
        <h2>Hướng dẫn mua hàng</h2>
        <p><strong>Bước 1:</strong> Truy cập website và lựa chọn sản phẩm cần mua để mua hàng.</p>

        <p><strong>Bước 2:</strong> Click vào sản phẩm muốn mua, màn hình sẽ hiển thị: <strong>Thêm vào giỏ hàng</strong></p>
        <ul>
          <li>Nếu bạn muốn xem giỏ hàng để cập nhật sản phẩm: Bấm vào <strong>“Xem giỏ hàng”</strong>.</li>
          <li>Nếu bạn muốn đặt hàng và thanh toán cho sản phẩm này: Bấm vào <strong>“Đặt hàng và thanh toán”</strong>.</li>
        </ul>

        <p><strong>Bước 3:</strong> Lựa chọn thông tin tài khoản thanh toán:</p>
        <ul>
          <li>Nếu bạn đã có tài khoản, vui lòng nhập email và mật khẩu.</li>
          <li>Nếu bạn chưa có tài khoản và muốn đăng ký, hãy điền đầy đủ thông tin cá nhân để tạo tài khoản. Việc có tài khoản giúp bạn dễ dàng theo dõi đơn hàng.</li>
        </ul>

        <p><strong>Bước 4:</strong> Điền các thông tin nhận hàng, lựa chọn hình thức thanh toán và phương thức vận chuyển phù hợp với bạn.</p>

        <p><strong>Bước 5:</strong> Kiểm tra lại toàn bộ thông tin đơn hàng, ghi chú thêm nếu cần, và bấm <strong>“Đặt hàng”</strong>.</p>

        <p>Sau khi tiếp nhận đơn hàng, chúng tôi sẽ liên hệ lại qua điện thoại để xác nhận đơn và địa chỉ giao hàng của bạn.</p>

        <p><em>Trân trọng cảm ơn!</em></p>
      </>
    )
  },

"huong-dan-doi-tra": {
  title: "Hướng dẫn đổi trả",
  content: (
    <>
      <h2>1. Khi nhận hàng, quý khách vui lòng kiểm tra:</h2>
      <ul>
        <li>Mở gói hàng và đối chiếu sản phẩm với hóa đơn thanh toán.</li>
        <li>Kiểm tra sản phẩm thực tế có đúng với sản phẩm đã đặt hay không.</li>
        <li>Kiểm tra bao bì và sản phẩm có bị hư hại trong quá trình vận chuyển hay không.</li>
      </ul>
      <p>
        Nếu phát hiện vấn đề, quý khách có thể yêu cầu nhân viên giao hàng xác nhận và <strong>có quyền từ chối nhận hàng</strong>.
      </p>
      <p><strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ hàng hóa trước khi ký nhận. Sau khi đã ký nhận, việc khiếu nại thiếu hàng hoặc giao sai hàng sẽ gặp khó khăn vì thiếu căn cứ xác minh với bên giao hàng.</p>

      <h2>2. Quy định đổi trả hàng mới</h2>
      <ul>
        <li>DoleSaiGon hỗ trợ đổi hoặc trả hàng trong vòng <strong>07 ngày</strong> kể từ ngày nhận hàng.</li>
        <li>Hàng hóa phải còn mới 100%, chưa qua sử dụng, còn nguyên nhãn mác, bao bì, phụ kiện, phiếu bảo hành và quà tặng đi kèm (nếu có).</li>
        <li>Khách hàng tự thanh toán chi phí vận chuyển và các chi phí phát sinh trong quá trình đổi trả.</li>
      </ul>

      <h2>3. Quy định đổi trả hàng giao sai hoặc không đúng yêu cầu</h2>
      <ul>
        <li>DoleSaiGon hỗ trợ đổi/trả <strong>miễn phí</strong> trong trường hợp giao sai hàng, thiếu hàng, hoặc lỗi do DoleSaiGon hoặc đơn vị vận chuyển, và quý khách chưa ký nhận hàng.</li>
        <li>Nếu đã ký nhận nhưng phát hiện vấn đề bất thường, vui lòng liên hệ ngay bộ phận <strong>Chăm sóc khách hàng</strong> của DoleSaiGon để được hỗ trợ theo quy trình xử lý khiếu nại.</li>
      </ul>
    </>
  )
},

"huong-dan-thanh-toan": {
  title: "Hướng dẫn thanh toán",
  content: (
    <>
      <h2>1. Thanh toán trực tiếp tại cửa hàng</h2>
      <ul>
        <li>Khách hàng đến trực tiếp cửa hàng để thanh toán và nhận hàng.</li>
        <li><strong>Ưu đãi:</strong> Nhận quà tặng kèm hấp dẫn.</li>
      </ul>

      <h2>2. Thanh toán online</h2>
      <ul>
        <li>Khách hàng thực hiện <strong>chuyển khoản trước</strong> để xác nhận đơn hàng.</li>
        <li>Hệ thống xác nhận và tiến hành giao hàng theo thông tin đã cung cấp.</li>
        <li><strong>Ưu đãi:</strong> Nhận quà tặng kèm bất kỳ (áp dụng cho các đơn thanh toán online).</li>
      </ul>

      <h2>3. Hỗ trợ khiếu nại, đổi trả sản phẩm</h2>
      <p>
        Nếu sản phẩm gặp lỗi từ phía DoleSaiGon hoặc cần đổi/trả sau thanh toán, quý khách vui lòng liên hệ Hotline: <strong>1900 0000</strong> để được hỗ trợ nhanh chóng.
      </p>
      <p>
        Tư vấn viên sẽ hướng dẫn chi tiết các bước cần thiết để tiến hành đổi trả hoặc hoàn tất thủ tục thanh toán liên quan.
      </p>
    </>
  )
},

"quy-dinh-bao-hanh": {
  title: "Quy định bảo hành",
  content: (
    <>
      <h2>1. Chế độ bảo hành sản phẩm tại DoleSaiGon</h2>
      <p>
        Các sản phẩm do Sudes Nest cung cấp đều được bảo hành theo chính sách của nhà sản xuất hoặc nhà phân phối chính thức tương ứng.
      </p>
      <p>
        Thông tin chi tiết về Trung tâm bảo hành được thể hiện trên <strong>phiếu bảo hành</strong> đi kèm với sản phẩm, bao gồm:
      </p>
      <ul>
        <li>Tên công ty hoặc đơn vị bảo hành</li>
        <li>Địa chỉ Trung tâm bảo hành</li>
        <li>Số điện thoại liên hệ</li>
        <li>Điều kiện bảo hành theo quy định từ nhà sản xuất hoặc nhà nhập khẩu</li>
      </ul>

      <h2>2. Các trường hợp không được bảo hành</h2>
      <ul>
        <li>Sản phẩm đã <strong>hết thời hạn bảo hành</strong> theo quy định ghi trong phiếu.</li>
        <li>Sản phẩm <strong>bị mất phiếu bảo hành</strong> do nhà sản xuất cấp.</li>
        <li>Tem bảo hành bị rách, không còn tem, bị dán đè hoặc đã bị sửa đổi (kể cả tem gốc).</li>
      </ul>
    </>
  )
},

"huong-dan-chuyen-khoan": {
  title: "Hướng dẫn chuyển khoản",
  content: (
    <>
      <h2>1. Thanh toán trực tiếp tại cửa hàng</h2>
      <p>Khách hàng đến cửa hàng của DoleSaiGon để thanh toán trực tiếp sẽ nhận được các ưu đãi.</p>

      <h2>2. Thanh toán chuyển khoản online</h2>
      <p>Khách hàng có thể lựa chọn hình thức chuyển khoản trước khi nhận hàng:</p>
      <ul>
        <li>Chuyển khoản trực tiếp vào tài khoản của DoleSaiGon theo hướng dẫn từ tư vấn viên</li>
        <li>Nhận quà tặng kèm bất kỳ khi thanh toán trước</li>
      </ul>

      <h2>3. Liên hệ khi cần hỗ trợ</h2>
      <p>
        Nếu sản phẩm có lỗi từ phía DoleSaiGon hoặc phát sinh khiếu nại, đổi trả, quý khách vui lòng liên hệ qua số Hotline: <strong>1900 0000</strong> để được hỗ trợ sớm nhất.
      </p>
      <p>
        Đội ngũ tư vấn viên của chúng tôi sẽ hướng dẫn quý khách các bước cần thiết để thực hiện quy trình hoàn trả hoặc xác nhận lại thanh toán.
      </p>
    </>
  )
},
};

export default function Instructions() {
  const { instructionType } = useParams();
  const data = instructionsData[instructionType];

  if (!data) {
    return (
      <div className="policy">
        <h1>Không tìm thấy hướng dẫn phù hợp</h1>
      </div>
    );
  }

  return (
    <div className="policy">
        <Helmet>
            <title>Hướng dẫn</title>
        </Helmet>
      <h1>{data.title}</h1>
      {data.content}
    </div>
  );
}
