package com.tofu.websocket.websocketISP.controllers;

import com.tofu.websocket.websocketISP.models.SayHi;
import com.tofu.websocket.websocketISP.models.Student;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class StudentSayHiController {
    @MessageMapping("/sayHi")
    @SendTo("/topic/sayHi")
    public SayHi sayHi(Student student) throws Exception {
        Thread.sleep(1000);
        return new SayHi("HIIIIIII, " + HtmlUtils.htmlEscape(student.getName()) + "!");
    }
}
