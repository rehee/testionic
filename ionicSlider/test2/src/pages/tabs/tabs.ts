import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';

import { Events } from 'ionic-angular';



@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = AboutPage;
  tab3Root: any = ContactPage;
  showTabs: boolean = true;
  tabsList: any[] = [
    {
      root: this.tab1Root,
      icon: 'home',
      text: 'Home'
    },
    {
      root: this.tab2Root,
      icon: 'information-circle',
      text: 'About'
    }
  ];
  refreshScrollbarTabs() {
    this.scrollableTabsopts = { refresh: true };   
     
  }
  scrollableTabsopts: any = {};
  
  addTab(): void {
    this.tabsList.push({
      root: this.tab1Root,
      icon: 'home',
      text: 'Home'
    });
    this.tabsList.push({
      root: this.tab1Root,
      icon: 'home',
      text: 'Home'
    });
    this.tabsList.push({
      root: this.tab1Root,
      icon: 'home',
      text: 'Home'
    });
    this.tabsList.push({
      root: this.tab1Root,
      icon: 'home',
      text: 'Home'
    });
    this.tabsList.push({
      root: this.tab1Root,
      icon: 'home',
      text: 'Home'
    });
    this.showTabs = !this.showTabs;
    this.refreshScrollbarTabs();
  };

  

  constructor(public events: Events) {
    this.events.subscribe('functionCall:tabSelected',(input)=>{
      this.addTab();
    });
  };
  
}
