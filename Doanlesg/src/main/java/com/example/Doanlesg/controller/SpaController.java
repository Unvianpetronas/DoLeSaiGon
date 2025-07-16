package com.example.Doanlesg.controller; // Use your correct package name

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    /**
     * Forwards requests for non-API, non-static-file paths to the root.
     * This allows the React Router to handle client-side routing.
     */
    @GetMapping(value = {"/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public String forward() {
        // Forward to the root path where index.html is served.
        return "forward:/index.html";
    }
}