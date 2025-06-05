package com.tofu.websocket.websocketISP.models;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Student {
    private String id;
    private String name;
    private float score;
}
