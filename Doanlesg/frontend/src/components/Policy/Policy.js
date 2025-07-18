// components/Policy/Policy.js
import React from 'react';
import { useParams } from 'react-router-dom';
import './Policy.css';

const contents = {
  "mua-hang": {
    title: "Chính sách mua hàng",
    content: (
      <>
        <h3>Chính sách thanh toán</h3>
        <p>
          Có 2 hình thức thanh toán, khách hàng có thể lựa chọn hình thức thuận tiện và phù hợp với mình nhất:
        </p>
        <ul>
          <li><strong>Cách 1:</strong> Thanh toán tiền mặt trực tiếp tại cửa hàng.
          Địa chỉ: Đường D1, Khu Công Nghệ Cao, TP Thủ Đức, TP.HCM </li>
          <li><strong>Cách 2:</strong> Chuyển khoản trước. Quý khách chuyển khoản trước, sau đó chúng tôi tiến hành giao hàng theo thỏa thuận hoặc hợp đồng với Quý khách.</li>
        </ul>
        <p>
          <strong>Lưu ý:</strong> Nội dung chuyển khoản ghi rõ họ tên và mã đơn hàng. Chúng tôi sẽ liên hệ xác nhận và tiến hành giao hàng. Nếu sau thời gian thỏa thuận mà chúng tôi không giao hàng hoặc không phản hồi lại, quý khách có thể gửi khiếu nại trực tiếp về cưửa hàng hoặc gọi hotline: <strong>1900 000</strong> và yêu cầu bồi thường.
        </p>
        <p>
          Đối với khách hàng có nhu cầu mua số lượng lớn để kinh doanh hoặc buôn sỉ vui lòng liên hệ trực tiếp với chúng tôi để có chính sách giá cả hợp lý. Việc thanh toán sẽ được thực hiện theo hợp đồng. Chúng tôi cam kết kinh doanh minh bạch, hợp pháp, bán hàng chất lượng, có nguồn gốc.
        </p>
        <h3>Chính sách xử lý khiếu nại</h3>
        <ul>
          <li>Tiếp nhận mọi khiếu nại của khách hàng liên quan đến việc sử dụng dịch vụ của công ty.</li>
          <li>Tất cả mọi trường hợp bảo hành, quý khách có thể liên hệ với chúng tôi để làm thủ tục bảo hành.</li>
          <li>Thời gian giải quyết khiếu nại trong thời hạn tối đa là <strong>03</strong> ngày làm việc kể từ khi nhận được khiếu nại của khách hàng. Trong trường hợp bất khả kháng, hai bên sẽ tự thương lượng.</li>
        </ul>
        <h3>Chính sách vận chuyển và giao nhận</h3>
        <p>
          Thông thường sau khi nhận được thông tin đặt hàng chúng tôi sẽ xử lý đơn hàng trong vòng 24h và phản hồi lại thông tin cho khách hàng về việc thanh toán và giao nhận. Thời gian giao hàng thường trong khoảng từ 3–5 giờ kể từ ngày chốt đơn hàng hoặc theo thỏa thuận với khách khi đặt hàng. Tuy nhiên, cũng có trường hợp việc giao hàng kéo dài hơn nhưng chỉ xảy ra trong những tình huống bất khả kháng như sau:
        </p>
        <ul>
          <li>Nhân viên chúng tôi liên lạc với khách hàng qua điện thoại không được nên không thể giao hàng.</li>
          <li>Địa chỉ giao hàng bạn cung cấp không chính xác.</li>
          <li>Số lượng đơn hàng tăng đột biến khiến việc xử lý đơn hàng bị chậm.</li>
          <li>Đối tác cung cấp hàng chậm hơn dự kiến khiến việc giao hàng bị chậm lại hoặc đối tác vận chuyển giao hàng bị chậm.</li>
        </ul>
        <p>
          Về phí vận chuyển, nhân viên của cửa hàng sẽ giao hàng và tính phí dựa theo vị trí của khách hàng. Khi liên hệ lại xác nhận đơn hàng với khách, chúng tôi sẽ báo mức phí cụ thể cho khách hàng.
        </p>
      </>
    )
  },

  "thanh-toan": {
    title: "Chính sách thanh toán",
    content: (
      <>
        <h3>Khách hàng thanh toán trực tiếp tại cửa hàng</h3>
        <ul>
          <li>Nhận quà tặng kèm theo đơn hàng.</li>
          <li>Thanh toán và nhận hàng trực tiếp tại địa chỉ: <strong>Đường D1, Khu Công Nghệ Cao, TP Thủ Đức, TP.HCM</strong></li>
        </ul>
        <h3>Khách hàng thanh toán online</h3>
        <ul>
          <li>Chuyển khoản khi đặt đơn.</li>
          <li>Xác nhận đơn hàng từ nhân viên trong 24h</li>
        </ul>
        <h3>Mọi thắc mắc xin liên hệ hotline: 1900 0000</h3>
      </>
    )
  },

  "van-chuyen": {
    title: "Chính sách vận chuyển",
    content: (
      <>
        <h2>I. Hình thức vận chuyển & giao nhận hàng hóa</h2>
        <p>
          Khi mua hàng tại <strong>DoleSaigon</strong>, quý khách có thể lựa chọn một trong các hình thức vận chuyển và giao nhận sau:
        </p>
        <ul>
          <li>DoleSaigon trực tiếp vận chuyển và giao hàng tận tay khách hàng.</li>
          <li>Khách hàng tự đặt đơn vị khác giao hàng đến nhận hàng</li>
        </ul>
        <h2>II. Nội dung chi tiết</h2>
        <h3>1. DoleSaigon trực tiếp giao hàng tận nơi</h3>
        <ul>
          <li><strong>Miễn phí giao hàng</strong> ở các quận 1, 2, 3, Thủ Đức, Bình Thạnh, Gò Vấp, Tân Bình.</li>
          <li>Phí giao hàng tính theo khoảng cách trong bán kính 60km.</li>
          <li><strong>Khung giờ giao hàng:</strong> từ 10h00 đến 18h00 hàng ngày.</li>
        </ul>
        <h3>2. Khách hàng đặt đơn vị khác giao hàng</h3>
        <ul>
          <li>
            <strong>Thời gian giao hàng</strong> phụ thuộc vào chính sách và cam kết của đơn vị vận chuyển.
          </li>
          <li>
            Để thuận tiện cho việc nhận hàng, quý khách vui lòng chủ động liên hệ với đơn vị chuyển phát để sắp xếp thời gian và địa điểm nhận hàng phù hợp.
          </li>
        </ul>
      </>
    )
  },

  "cam-ket": {
    title: "Cam kết cửa hàng",
    content: (
      <>
        <h3>Về Mâm Lễ</h3>
        <p>
          Tại DoleSaigon, chúng tôi cam kết mang đến những mâm lễ chỉn chu, đầy đủ và trang trọng:
        </p>
        <ul>
          <li>Thực phẩm sử dụng luôn tươi mới, sạch và an toàn.</li>
          <li>Nguyên liệu được lựa chọn kỹ từ nhà cung cấp trong ngày, đảm bảo vệ sinh an toàn thực phẩm theo tiêu chuẩn cao.</li>
          <li>Cam kết giao hàng trong vòng <strong>4 giờ</strong> sau khi xác nhận đơn, giữ nguyên độ tươi và chất lượng sản phẩm.</li>
          <li>Hình thức mâm lễ được trình bày đẹp mắt, đúng như hình ảnh minh họa trên website.</li>
        </ul>
        <h3>Về Quà Lễ</h3>
        <p>
          Với các sản phẩm quà lễ tại DoleSaigon, khách hàng có thể hoàn toàn yên tâm về chất lượng và nguồn gốc:
        </p>
        <ul>
          <li>Tất cả quà lễ đều là <strong>hàng chính hãng</strong>, có nguồn gốc rõ ràng và được chọn lựa kỹ càng.</li>
          <li>Thời gian <strong>bảo hành 12 tháng</strong>, hỗ trợ đổi trả theo chính sách minh bạch của DoleSaigon.</li>
          <li>Quà tặng được đóng gói trang trọng, lịch sự – phù hợp cho các dịp biếu tặng hoặc nghi lễ truyền thống.</li>
        </ul>
      </>
    )
  },

  "bao-mat": {
    title: "Chính sách bảo mật",
    content: (
      <>
        <p>
          Mọi thông tin khách hàng cung cấp khi mua hàng tại <strong>DoleSaigon</strong> đều được bảo mật tuyệt đối. Chúng tôi cam kết không mua bán, chia sẻ hay sử dụng thông tin cá nhân vì mục đích xấu.
        </p>
        <h3>I. Mục đích và phạm vi thu thập</h3>
        <p>
          Các thông tin được thu thập bao gồm: Họ tên, email, số điện thoại, địa chỉ,… nhằm phục vụ các hoạt động:
        </p>
        <ul>
          <li>Liên hệ xác nhận đơn hàng, tư vấn hỗ trợ mua hàng.</li>
          <li>Giao hàng đến đúng địa chỉ.</li>
        </ul>
        <p>
          Khách hàng có trách nhiệm bảo mật thông tin hộp thư của mình và thông báo ngay cho DoleSaigon nếu phát hiện hành vi sử dụng trái phép.
        </p>
        <h3>II. Phạm vi sử dụng thông tin</h3>
        <ul>
          <li>Cung cấp dịch vụ & giao hàng theo yêu cầu.</li>
          <li>Liên hệ xử lý các tình huống đặc biệt liên quan đến giao dịch.</li>
          <li>Cung cấp thông tin theo yêu cầu hợp pháp từ cơ quan nhà nước.</li>
        </ul>
        <h3>III. Thời gian lưu trữ thông tin</h3>
        <p>
          Thông tin được lưu trữ trong suốt quá trình hợp tác giữa DoleSaigon và khách hàng. Khách hàng có thể yêu cầu hủy thông tin nếu chấm dứt giao dịch.
        </p>
        <h3>IV. Quyền của khách hàng</h3>
        <p>
          Khách hàng có thể kiểm tra, điều chỉnh, yêu cầu xóa thông tin cá nhân bằng cách liên hệ qua email của DoleSaigon. Chúng tôi sẽ hỗ trợ kỹ thuật để xử lý yêu cầu trong thời gian sớm nhất.
        </p>
        <h3>V. Cam kết bảo mật</h3>
        <ul>
          <li>Cam kết không chia sẻ thông tin khách hàng cho bên thứ ba nếu không có sự đồng ý.</li>
          <li>Thông tin chỉ chia sẻ với đơn vị vận chuyển để giao hàng.</li>
          <li>Nếu hệ thống bị tấn công gây rò rỉ dữ liệu, DoleSaigon sẽ thông báo đến cơ quan chức năng và khách hàng kịp thời.</li>
          <li>Yêu cầu khách hàng cung cấp thông tin chính xác khi mua hàng. Chúng tôi không chịu trách nhiệm với các khiếu nại phát sinh từ thông tin sai lệch.</li>
        </ul>
        <p>
          DoleSaigon luôn quan tâm đến quyền riêng tư của khách hàng. Mọi thắc mắc, góp ý về chính sách bảo mật, vui lòng liên hệ với chúng tôi để được hỗ trợ.
        </p>
      </>
    )
  },
};

export default function Policy() {
  const { policyType } = useParams();
  const policy = contents[policyType];

  if (!policy) return <div className="policy"><h2>Chính sách không tồn tại</h2></div>;

  return (
    <div className="policy">
      <h1>{policy.title}</h1>
      <div className="policy-content">
        {policy.content}
      </div>
    </div>
  );
}
