package com.example.Doanlesg.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CheckoutRequestDTO {
    // ID của khách hàng nếu đã đăng nhập
    private Long customerId;

    // Thông tin khách vãng lai nếu chưa đăng nhập
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String guestAddress;

    private Long guestDistrictId;
    private String guestWardCode;

    // Thông tin chung
    private Long shippingMethodId;
    private Long paymentMethodId;
    private String voucherCode;// (Tùy chọn)



    // Danh sách sản phẩm trong giỏ hàng (quan trọng cho guest)
    // Đối với customer đã đăng nhập, có thể lấy từ cart của họ trong DB
    private List<CartItemDTO> items;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public String getGuestAddress() {
        return guestAddress;
    }

    public void setGuestAddress(String guestAddress) {
        this.guestAddress = guestAddress;
    }

    public Long getShippingMethodId() {
        return shippingMethodId;
    }

    public void setShippingMethodId(Long shippingMethodId) {
        this.shippingMethodId = shippingMethodId;
    }

    public Long getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(Long paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

}
