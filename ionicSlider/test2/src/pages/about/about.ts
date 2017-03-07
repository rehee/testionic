import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import{TabsPage}from'../tabs/tabs';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  refresh():void{
    this.events.publish('functionCall:tabSelected', "123");
  };

  constructor(public navCtrl: NavController, public events : Events) {
    
  }

}
