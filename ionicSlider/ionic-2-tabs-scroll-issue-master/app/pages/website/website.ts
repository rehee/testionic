import {Component} from "@angular/core";
import {SafeResourceUrl} from "@angular/platform-browser";
import {UrlSanitizerService} from "../../providers/urlSanitizer.service";

@Component({
    templateUrl: './build/pages/website/website.html',
    providers: [UrlSanitizerService]
})
export class WebsiteComponent {
    url:SafeResourceUrl;

    constructor(private urlSanitizerService:UrlSanitizerService) {
        this.url = urlSanitizerService.sanitize("http://www.w3schools.com/html/html_iframe.asp");
    }
}
