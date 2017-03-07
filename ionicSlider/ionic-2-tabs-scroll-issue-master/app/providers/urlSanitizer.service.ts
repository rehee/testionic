import {Injectable} from "@angular/core";
import {DomSanitizationService} from "@angular/platform-browser";

@Injectable()
export class UrlSanitizerService {
    constructor(private sanitizer:DomSanitizationService) {
    }

    sanitize(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}