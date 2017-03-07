import { Injectable } from '@angular/core';
import { LayoutModule } from "../layout-module";

@Injectable()
export class CommonService {

    layout = new LayoutModule();

    constructor() {  }
}


