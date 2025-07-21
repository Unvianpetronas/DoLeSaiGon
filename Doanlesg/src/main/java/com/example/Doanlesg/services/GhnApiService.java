package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.GhnCreateOrderRequest;
import com.example.Doanlesg.dto.GhnCreateOrderResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class GhnApiService {

    private static final Logger logger = LoggerFactory.getLogger(GhnApiService.class);

    private final WebClient webClient;

    /**
     * Constructor này sẽ được Spring tự động gọi.
     * Nó đọc các giá trị từ file application.properties và khởi tạo WebClient.
     * WebClient là công cụ hiện đại của Spring để thực hiện các cuộc gọi API.
     */
    public GhnApiService(
            @Value("${GHN_API_URL}") String apiUrl,
            @Value("${GHN_API_TOKEN}") String token,
            @Value("${GHN_API_SHOP_ID}") String shopId) {

        this.webClient = WebClient.builder()
                .baseUrl(apiUrl) // URL cơ sở của API GHN
                .defaultHeader("Token", token) // Header chứa Token xác thực
                .defaultHeader("ShopId", shopId) // Header chứa Shop ID
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Phương thức này gửi yêu cầu tạo đơn hàng đến GHN.
     * @param request Đối tượng chứa thông tin đơn hàng cần tạo.
     * @return Một Mono chứa đối tượng phản hồi từ GHN sau khi tạo đơn thành công.
     */
    public Mono<GhnCreateOrderResponse> createOrder(GhnCreateOrderRequest request) {
        return this.webClient.post()
                .uri("/v2/shipping-order/create")
                .bodyValue(request)
                .retrieve()
                // THÊM ĐOẠN NÀY ĐỂ BẮT LỖI CHI TIẾT
                .onStatus(
                        HttpStatusCode::is4xxClientError, // Bắt tất cả các lỗi 4xx (như 400, 401, 403...)
                        clientResponse -> clientResponse.bodyToMono(String.class) // Đọc body của lỗi dưới dạng String
                                .flatMap(errorBody -> {
                                    // Ghi log lại nội dung lỗi chi tiết từ GHN
                                    logger.error("Lỗi chi tiết từ GHN: " + errorBody);
                                    // Trả về một lỗi mới chứa thông điệp chi tiết này
                                    return Mono.error(new RuntimeException(errorBody));
                                })
                )
                .bodyToMono(GhnCreateOrderResponse.class);
    }
}