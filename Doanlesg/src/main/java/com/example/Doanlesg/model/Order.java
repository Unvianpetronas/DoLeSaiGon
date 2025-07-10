package com.example.Doanlesg.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders")
@Setter
@Getter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id", nullable = false)
    private Long id;

    @Column(name = "order_code", nullable = false)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = true)
    @JsonBackReference("account-orders")
    private Account account;

    @Column(name = "receiver_fullname", nullable = false)
    private String receiverFullName;

    @Column(name = "receiver_phonenumber", nullable = false)
    private String receiverPhoneNumber;
    @Column(name = "receiver_mail", nullable = false)
    private  String receiverEmail;
    @Column(name = "fullshipping_address", nullable = false)
    private String fullShippingAddress;

    @Column(name = "order_date", nullable = false)
    private Instant orderDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @NotNull
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_method_id")
    private ShippingMethod shippingMethod;

    @Size(max = 50)
    @NotNull
    @Nationalized
    @Column(name = "order_status", nullable = false, length = 50)
    private String orderStatus;

    @Nationalized
    @Lob
    @Column(name = "notes")
    private String notes;

    @OneToMany(mappedBy ="order", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;
}