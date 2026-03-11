package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.services.AccountServices;
import com.example.Doanlesg.services.CartServices;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
@RequestMapping("/api/ver0.0.1/cartItem")
public class CartItemController {

    private final static String ACCOUNT = "account_id";
    private final CartServices cartServices;
    private final AccountServices accountServices;
    private static final Logger logger = LoggerFactory.getLogger(CartItemController.class);

    public CartItemController(CartServices cartServices, AccountServices accountServices) {
        this.cartServices = cartServices;
        this.accountServices = accountServices;
    }

    @GetMapping("/allCartItem")
    public List<CartItemDTO> getAllCartItems(HttpSession session) {

        Long accountId = (Long) session.getAttribute(ACCOUNT);
        if (accountId == null) {
            logger.warn("Unauthorized access attempt to get cart items");
            return Collections.emptyList();
        }

        try {
            // 2. Get account
            Account account = accountServices.findById(accountId);

            // 3. Check staff/admin
            if (account == null || account.getStaff() != null || account.getAdmin() != null) {
                logger.info("Staff/Admin {} attempted to access cart", accountId);
                return Collections.emptyList();
            }

            // 4. Check cart exists
            if (account.getCart() == null) {
                logger.info("Account {} has no cart, returning empty list", accountId);
                return Collections.emptyList();
            }

            // 5. Get cart items (ownership check in service)
            Long cartId = account.getCart().getId();
            return cartServices.getAllCartItems(accountId, cartId);

        } catch (Exception e) {
            logger.error("Error getting cart items for account {}: {}", accountId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCartItem(HttpSession session, @RequestBody CartItemDTO cartItemRequest) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);

        if (accountId == null) {
            logger.warn("Unauthorized add cart item attempt");
            return new ResponseEntity<>("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", HttpStatus.UNAUTHORIZED);
        }

        try {
            Account account = accountServices.findById(accountId);
            if (account == null) {
                logger.error("Account not found: {}", accountId);
                return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
            }

            Long cartId;
            if (account.getCart() == null) {
                logger.info("Creating new cart for account {}", accountId);
                cartId = accountServices.getOrCreateCartId(accountId);
            } else {
                cartId = account.getCart().getId();
            }

            // Service will validate ownership
            cartServices.addItem(accountId, cartId, cartItemRequest.getProductId(), cartItemRequest.getQuantity());

            logger.info("Successfully added product {} to cart {} for account {}",
                    cartItemRequest.getProductId(), cartId, accountId);

            return new ResponseEntity<>("Sản phẩm đã được thêm vào giỏ hàng.", HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi bảo mật: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            logger.error("Error adding item to cart for account {}: {}", accountId, e.getMessage());
            return new ResponseEntity<>("Lỗi khi thêm sản phẩm: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/updateId")
    public ResponseEntity<String> updateQuantity(HttpSession session, @RequestParam Long productId, @RequestParam int quantity) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);

        if (accountId == null) {
            logger.warn("Unauthorized update quantity attempt");
            return new ResponseEntity<>("Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED);
        }

        try {
            Account account = accountServices.findById(accountId);
            if (account == null) {
                logger.error("Account not found: {}", accountId);
                return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
            }

            if (account.getCart() == null) {
                return new ResponseEntity<>("Giỏ hàng không tồn tại.", HttpStatus.NOT_FOUND);
            }
            Long cartId = account.getCart().getId();
            // Service will validate ownership
            cartServices.updateItemQuantityFromCart(accountId, cartId, productId, quantity);

            logger.info("Successfully updated product {} quantity to {} in cart {} for account {}",
                    productId, quantity, cartId, accountId);

            return ResponseEntity.ok("Cập nhật số lượng thành công.");

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi bảo mật: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            logger.error("Error updating quantity for account {}: {}", accountId, e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/removeId")
    public ResponseEntity<String> removeCartItem(HttpSession session, @RequestParam Long productId) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);

        if (accountId == null) {
            logger.warn("Unauthorized remove item attempt");
            return new ResponseEntity<>("Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED);
        }

        try {
            Account account = accountServices.findById(accountId);
            if (account == null) {
                logger.error("Account not found: {}", accountId);
                return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
            }

            if (account.getCart() == null) {
                logger.warn("Account {} has no cart", accountId);
                return new ResponseEntity<>("Giỏ hàng trống.", HttpStatus.NOT_FOUND);
            }

            Long cartId = account.getCart().getId();

            // Service will validate ownership
            cartServices.removeItemFromCart(accountId, cartId, productId);

            logger.info("Successfully removed product {} from cart {} for account {}",
                    productId, cartId, accountId);

            return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ hàng.");

        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi bảo mật: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            logger.error("Error removing item for account {}: {}", accountId, e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(HttpSession session) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);

        if (accountId == null) {
            logger.warn("Unauthorized clear cart attempt");
            return new ResponseEntity<>("Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED);
        }

        try {
            Account account = accountServices.findById(accountId);
            if (account == null) {
                logger.error("Account not found: {}", accountId);
                return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
            }

            if (account.getCart() == null) {
                logger.info("Account {} has no cart to clear", accountId);
                return ResponseEntity.ok("Giỏ hàng đã trống.");
            }

            Long cartId = account.getCart().getId();

            // Service will validate ownership
            cartServices.clearCart(accountId, cartId);

            logger.info("Successfully cleared cart {} for account {}", cartId, accountId);

            return ResponseEntity.ok("Đã xóa tất cả sản phẩm khỏi giỏ hàng.");

        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            return new ResponseEntity<>("Lỗi bảo mật: " + e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            logger.error("Error clearing cart for account {}: {}", accountId, e.getMessage());
            return new ResponseEntity<>("Lỗi: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
