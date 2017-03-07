import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import {CommonService} from'../../services/common-service';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  layout:any = this.service.layout;

  constructor(public navCtrl: NavController,public service :CommonService) {

  }

}
