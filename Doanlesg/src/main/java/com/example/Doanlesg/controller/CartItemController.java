package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.services.CartServices;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/ver0.0.1/cartItem")
public class CartItemController {
    final CartServices cartServices;
    private AccountRepository accountRepository;
    public CartItemController(CartServices cartServices, AccountRepository accountRepository) {
        this.cartServices = cartServices;
        this.accountRepository = accountRepository;
    }
    @GetMapping("/allCartItem")
    public List<CartItemDTO> getAllCartItems(@RequestParam Long cartId) {
        return cartServices.getAllCartItems(cartId);
    }
    @GetMapping("/addId")
    public void addCartItem(@AuthenticationPrincipal UserDetails userDetails, @RequestParam Long productId, @RequestParam int quantity) {
        String email = userDetails.getUsername();
       Optional<Account> account = accountRepository.findByEmail(email);
        // or Account account = (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (account.isPresent()) {
            cartServices.addItem(account.get().getId(), productId,quantity);
        }else{
            throw new IllegalArgumentException("<UNK> <UNK> <UNK> <UNK> <UNK> <UNK>.");
        }
    }


    @GetMapping("/updateId")
    public void updateQuantity(@RequestParam Long productId, @RequestParam int quantity) {
        //String email = userDetails.getUsername();
        //Account account = accountRepository.findByEmail(email);
        Account account = (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (account != null) {
            cartServices.updateItemQuantityFromCart(account.getCart().getId(),productId,quantity);
        }else {
            throw new IllegalArgumentException("<UNK> <UNK> <UNK> <UNK> <UNK> <UNK>.");
        }
    }

    @GetMapping("/removeId")
    public void removeCartItem(@RequestParam Long productId) {
        //String email = userDetails.getUsername();
        //Account account = accountRepository.findByEmail(email);
        Account account = (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if(account != null){
            cartServices.RemoveItemFromCart(account.getCart().getId(),productId);
        }
    }
}
