package com.example.Doanlesg.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class GuestCartDTO {

    private List<CartItemDTO> items = new ArrayList<>();

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void addItem(CartItemDTO newItem) {
        Optional<CartItemDTO> existingItem = items.stream()
                .filter(item -> item.getProductId().equals(newItem.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItemDTO item = existingItem.get();
            item.setQuantity(item.getQuantity() + newItem.getQuantity());
        } else {
            items.add(newItem);
        }
    }
   public void removeItem(Long productId) {
       items.removeIf(item -> item.getProductId().equals(productId));
   }
    public void updateItemQuantityFromCart(CartItemDTO newItem, int newQuantity) throws Exception {
        if (newQuantity < 0) {
            throw new Exception("số lượng phải lơn hơn 0");
        }else  if (newQuantity == 0) {
            items.removeIf(item -> item.getProductId().equals(newItem.getProductId()));
        } else if (newQuantity > 0) {
            Optional<CartItemDTO> existingItem = items.stream().filter(item -> item.getProductId().equals(newItem.getProductId())).findFirst();
            existingItem.ifPresent(item -> item.setQuantity( newQuantity));
        }
    }
}