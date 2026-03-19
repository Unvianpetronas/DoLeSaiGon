package com.example.Doanlesg.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.text.Normalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatProxyController {

    private static final Logger logger = LoggerFactory.getLogger(ChatProxyController.class);
    private static final int MAX_REQUESTS_PER_MINUTE = 20;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> windowStart = new ConcurrentHashMap<>();

    @Value("${LMSTUDIO_URL:http://localhost:1234/v1/chat/completions}")
    private String lmStudioUrl;

    @Value("${LMSTUDIO_MODEL:local-model}")
    private String lmStudioModel;

    @PostMapping("/consult")
    public ResponseEntity<?> consult(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (isRateLimited(clientIp)) {
            logger.warn("Rate limit exceeded for IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ một chút."));
        }

        String customerId = String.valueOf(body.getOrDefault("customer_id", ""));
        String sessionId = String.valueOf(body.getOrDefault("session_id", "session_" + System.currentTimeMillis()));
        String message = String.valueOf(body.getOrDefault("message", ""));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> products = (List<Map<String, Object>>) body.getOrDefault("products", List.of());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cart = (List<Map<String, Object>>) body.getOrDefault("cart", List.of());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> purchaseHistory = (List<Map<String, Object>>) body.getOrDefault("purchase_history", List.of());

        if (customerId.isBlank() || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Missing required fields: customer_id, message"));
        }

        try {
            String[] msgWords = normalize(message).split("\\s+");

            // Filter in-stock products, score by keyword relevance
            List<Map<String, Object>> relevant = products.stream()
                    .filter(p -> {
                        Object stock = p.get("stock");
                        return stock instanceof Number && ((Number) stock).intValue() > 0;
                    })
                    .filter(p -> scoreProduct(p, msgWords) > 0)  // drop products with no keyword match
                    .sorted(Comparator.comparingInt((Map<String, Object> p) -> scoreProduct(p, msgWords)).reversed())
                    .limit(5)
                    .collect(Collectors.toList());

            // If no products matched keywords, fall back to top 5 by default (general question)
            if (relevant.isEmpty()) {
                relevant = products.stream()
                        .filter(p -> {
                            Object stock = p.get("stock");
                            return stock instanceof Number && ((Number) stock).intValue() > 0;
                        })
                        .limit(5)
                        .collect(Collectors.toList());
            }

            // Build name -> sku lookup for injecting SKU into recommendations later
            Map<String, String> nameToSku = new HashMap<>();
            for (Map<String, Object> p : products) {
                String n = String.valueOf(p.getOrDefault("name", "")).toLowerCase().trim();
                String s = String.valueOf(p.getOrDefault("sku", ""));
                if (!n.isEmpty() && !s.isEmpty()) nameToSku.put(n, s);
            }

            String productCatalog = relevant.stream().map(p -> {
                String name = String.valueOf(p.getOrDefault("name", ""));
                String category = String.valueOf(p.getOrDefault("category", ""));
                double price = p.get("price") instanceof Number ? ((Number) p.get("price")).doubleValue() : 0;
                String desc = String.valueOf(p.getOrDefault("description", ""));
                if (desc.length() > 50) desc = desc.substring(0, 50);
                return name + "|" + category + "|" + String.format("%,.0f", price) + "đ|" + desc;
            }).collect(Collectors.joining("\n"));

            String cartSummary = cart.isEmpty() ? "Trống" :
                    cart.stream().map(c -> c.get("name") + " ×" + c.get("quantity"))
                            .collect(Collectors.joining(", "));

            String historySummary = purchaseHistory.isEmpty() ? "Chưa có" :
                    purchaseHistory.stream().limit(5)
                            .map(h -> h.get("name") + " x" + h.getOrDefault("times_bought", 1))
                            .collect(Collectors.joining(", "));

            String systemPrompt = """
/no_think
Bạn là tư vấn viên của Dole Saigon – shop chuyên đồ lễ, mâm cúng truyền thống Việt Nam.
Địa chỉ: Đường D1, Khu CNC, Thủ Đức, HCM.

PHONG CACH TRA LOI (bat buoc):
- Luon xung "bên mình" hoặc "shop". Gọi khách là "bạn".
- Mở đầu bằng câu xác nhận phù hợp thực tế (vd: "Dạ có ạ!", "Dạ rất tiếc...", "Dạ chào bạn!").
- Neu tim thay san pham → reply phai neu TEN san pham, GIA, va 1 cau mo ta ngan.
- Kết thúc bằng lời mời (vd: "Bạn muốn đặt hàng không ạ?", "Bạn cần tư vấn thêm không ạ?").
- TUYET DOI khong tra loi chi 1-2 tu ("có", "không có", "Dạ bên mình có nhé!"). Phai viet it nhat 2 cau day du.
- Giong than thien, nhiet tinh nhu nhan vien ban hang that.

CHINH SACH:
- Thanh toan: tien mat tai cua hang hoac chuyen khoan truoc.
- Giao hang mien phi: Q1,Q2,Q3,Q4,Q5,Q7,Q8,Thủ Đức,Bình Thạnh,Gò Vấp,Tân Bình. Ngoai ra tinh phi (60km). Gio giao 10h-18h, giao trong 3-5h sau xac nhan.
- Doi tra: 7 ngay, con moi 100%.

QUY TAC SAN PHAM (bat buoc):
[QT-1] Chi dung san pham co TEN KHOP trong danh sach. Khong bia san pham.
[QT-2] KH hoi "shop co ban X khong" → kiem tra TEN san pham X co trong danh sach khong:
  - Co ten khop → tra loi "co", goi y san pham do, neu gia va mo ta.
  - Khong co ten khop → tra loi "shop khong ban X", goi y san pham tuong tu neu co (recommendations = []).
[QT-3] Hoi dich danh 1 san pham (vd "xoi gac") → recommendations chi co DUNG 1 phan tu.
[QT-4] Hoi danh muc (vd "xoi") → chi goi y san pham cung danh muc (toi da 5).
[QT-5] Vi du SAI: KH hoi "banh mi" → catalog co "Mam banh" → KHONG duoc noi "co ban banh mi". Phai noi "shop khong ban banh mi" va goi y Mam banh thay the.

CHI TRA VE JSON THUAN, KHONG markdown, KHONG text ngoai JSON:
{"reply":"...","intent":"product_query|price_check|recommendation|policy_query|greeting|complaint|other","recommendations":[{"name":"...","sku":"...","category":"...","price":0,"unit":"...","description":"...","url":"...","reason":"..."}]}
""";

            String userPrompt = "KH hỏi: \"" + message + "\""
                    + "\nGiỏ: " + cartSummary
                    + "\nSản phẩm CÓ SẴN trong kho (CHỈ dùng những sản phẩm này, không bịa thêm):\n" + productCatalog
                    + "\nNếu KH hỏi về sản phẩm có trong danh sách trên → trả lời CÓ và gợi ý ngay."
                    + "\nJSON:";

            // Build LM Studio request (OpenAI-compatible)
            Map<String, Object> lmRequest = new LinkedHashMap<>();
            lmRequest.put("model", lmStudioModel);
            lmRequest.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));
            lmRequest.put("temperature", 0.1);
            lmRequest.put("max_tokens", 800);
            lmRequest.put("stream", false);
            lmRequest.put("enable_thinking", false);
            lmRequest.put("chat_template_kwargs", Map.of("enable_thinking", false));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(lmRequest, headers);

            ResponseEntity<Map> lmResponse = restTemplate.exchange(
                    lmStudioUrl + "/v1/chat/completions", HttpMethod.POST, entity, Map.class);

            Map responseBody = lmResponse.getBody();
            if (responseBody == null) throw new IllegalStateException("Empty response from LM Studio");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices == null || choices.isEmpty())
                throw new IllegalStateException("No choices in LM Studio response: " + responseBody);

            @SuppressWarnings("unchecked")
            Map<String, Object> msgMap = (Map<String, Object>) choices.get(0).get("message");
            if (msgMap == null) throw new IllegalStateException("Null message in LM Studio choice");
            String rawText = String.valueOf(msgMap.getOrDefault("content", ""));

            Map<String, Object> parsed = parseAiResponse(rawText);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> recs = ((List<Map<String, Object>>) parsed.getOrDefault("recommendations", List.of()))
                    .stream().limit(5)
                    .map(r -> {
                        String recName = String.valueOf(r.getOrDefault("name", ""));
                        String sku = nameToSku.getOrDefault(recName.toLowerCase().trim(), "");
                        Map<String, Object> rec = new LinkedHashMap<>();
                        rec.put("sku", sku);
                        rec.put("name", recName);
                        rec.put("reason", r.getOrDefault("reason", ""));
                        rec.put("price", r.getOrDefault("price", 0));
                        rec.put("category", r.getOrDefault("category", ""));
                        return rec;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("session_id", sessionId);
            data.put("reply", parsed.getOrDefault("reply", ""));
            data.put("recommendations", recs);
            data.put("intent", parsed.getOrDefault("intent", "other"));

            return ResponseEntity.ok(Map.of("success", true, "data", data));

        } catch (Exception e) {
            logger.error("Error calling LM Studio: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Lỗi kết nối đến dịch vụ AI. Hãy chắc chắn LM Studio đang chạy."));
        }
    }

    private static final Set<String> STOPWORDS = Set.of(
            "co", "cac", "loai", "nao", "gi", "la", "va", "toi", "ban",
            "muon", "can", "the", "nhu", "vay", "khi", "duoc", "khong",
            "mot", "hai", "nhung", "da", "dang", "se", "thi",
            "len", "xuong", "ra", "vao", "tu", "den", "trong", "ngoai",
            "hay", "van", "ve", "oi", "vui", "long", "xin", "cam", "on",
            "bao", "nhieu", "gia", "mua", "tim", "thich", "hoi", "xem",
            "gioi", "thieu", "cho", "biet", "dung", "tot", "nhat", "noi",
            "shop", "nhe", "nha"
    );
    // NOTE: "cung" (cúng) removed — it is a core product-domain word.
    // "day" (đầy) also removed — appears in "mâm cúng đầy tháng" product names.

    /** Strip Vietnamese diacritics and lowercase — "Chè" → "che", "Có" → "co" */
    private String normalize(String s) {
        if (s == null) return "";
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'd')
                .toLowerCase();
    }

    private int scoreProduct(Map<String, Object> p, String[] words) {
        String name     = normalize(String.valueOf(p.getOrDefault("name",        "")));
        String category = normalize(String.valueOf(p.getOrDefault("category",    "")));
        String desc     = normalize(String.valueOf(p.getOrDefault("description", "")));

        int score = 0;
        for (String w : words) {
            String nw = normalize(w);
            if (nw.length() < 2 || STOPWORDS.contains(nw)) continue;
            if (name.contains(nw))     score += 3;
            if (category.contains(nw)) score += 2;
            if (desc.contains(nw))     score += 1;
        }
        return score;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseAiResponse(String rawText) {
        // 1. Strip <think>...</think> blocks (Qwen3 reasoning traces).
        //    Also handle unclosed <think> (model truncated mid-thought — no </think>).
        String cleaned = rawText.replaceAll("(?s)<think>.*?</think>", "").trim();
        if (cleaned.contains("<think>")) {
            cleaned = cleaned.substring(0, cleaned.indexOf("<think>")).trim();
        }

        // 2. Strip markdown code fences  ```json ... ``` or ``` ... ```
        cleaned = cleaned.replaceAll("(?s)```[a-zA-Z]*\\s*", "").replaceAll("```", "").trim();

        try {
            return objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e1) {
            try {
                int start = cleaned.indexOf('{');
                int end   = cleaned.lastIndexOf('}');
                if (start >= 0 && end > start) {
                    return objectMapper.readValue(cleaned.substring(start, end + 1), Map.class);
                }
            } catch (Exception e2) {
                // fall through
            }
            return Map.of(
                    "reply", cleaned.isBlank() ? "Xin lỗi, tôi không thể xử lý yêu cầu. Vui lòng thử lại." : cleaned,
                    "recommendations", List.of(),
                    "intent", "other"
            );
        }
    }

    private boolean isRateLimited(String ip) {
        long now = System.currentTimeMillis();
        long windowMs = 60_000L;

        windowStart.merge(ip, now, (existing, newVal) ->
                (now - existing > windowMs) ? newVal : existing);

        if (now - windowStart.get(ip) > windowMs) {
            windowStart.put(ip, now);
            requestCounts.put(ip, new AtomicInteger(1));
            return false;
        }

        AtomicInteger count = requestCounts.computeIfAbsent(ip, k -> new AtomicInteger(0));
        return count.incrementAndGet() > MAX_REQUESTS_PER_MINUTE;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}