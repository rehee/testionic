import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import {CommonService} from'../../services/common-service';
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  refresh(): void {
    this.service.layout.title = "button has been clicked";
    this.events.publish('functionCall:tabSelected', "123");
  };
  
  layout:any = this.service.layout;
  constructor(public navCtrl: NavController, public events: Events,public service:CommonService) {

  }

}
