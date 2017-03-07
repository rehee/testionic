import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {SchedulePage} from "../schedule/schedule";
import {WebsiteComponent} from "../website/website";


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root:any = SchedulePage;
  tab3Root:any = WebsiteComponent;
  mySelectedIndex:number;

  constructor(navParams:NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }
}
