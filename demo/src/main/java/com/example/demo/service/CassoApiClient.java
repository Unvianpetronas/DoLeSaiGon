package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

// Đặt tên class là CassoApiClient hoặc tên nào bạn thấy phù hợp
public class CassoApiClient {

    // Khai báo các hằng số tương tự như trong JavaScript
    private static final String API_KEY = "AK_CS.3fd5c9d041ef11f0a0f57b99bc550e36.rIxHt2VKsLHiHaeOizNnmunHUKoekeNAFFT143B9sLv4ugBfzIpnyv5PA38vPUvkX9SyhrFd";
    private static final String API_GET_PAID_URL = "https://oauth.casso.vn/v2/transactions";

    // Hàm main là điểm bắt đầu của chương trình Java
    public static void main(String[] args) {

        // 1. Tạo một đối tượng HttpClient để gửi yêu cầu
        // Tương đương với việc trình duyệt có sẵn hàm fetch
        HttpClient client = HttpClient.newHttpClient();

        // 2. Xây dựng yêu cầu HTTP (HttpRequest)
        // Đây là bước định nghĩa URL và các headers cần gửi đi
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_GET_PAID_URL)) // Đặt URL của API
                .header("Authorization", "apikey " + API_KEY) // Thêm header Authorization
                .header("Content-Type", "application/json") // Thêm header Content-Type
                .GET() // Chỉ định phương thức là GET
                .build();

        try {
            // 3. Gửi yêu cầu và nhận phản hồi
            // client.send(...) sẽ đợi cho đến khi có phản hồi, tương tự như `await`
            // BodyHandlers.ofString() yêu cầu nhận nội dung phản hồi dưới dạng chuỗi (String)
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // 4. In mã trạng thái (status code) và nội dung (body) của phản hồi
            // Tương đương với `console.log(data)`
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Response Body (JSON):");
            System.out.println(response.body());

        } catch (IOException | InterruptedException e) {
            // Xử lý các lỗi có thể xảy ra khi gọi API (ví dụ: mất mạng)
            System.err.println("Đã xảy ra lỗi khi gọi API: " + e.getMessage());
            e.printStackTrace();
        }
    }
}