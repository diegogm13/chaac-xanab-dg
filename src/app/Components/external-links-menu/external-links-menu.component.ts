import { Component, OnInit } from '@angular/core';
import { ExternalLink } from '../Models/external-link.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-external-links-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './external-links-menu.component.html',
  styleUrls: ['./external-links-menu.component.css']
})
export class ExternalLinksMenuComponent implements OnInit {
  links: ExternalLink[] = [
    { name: 'Nike', url: 'https://www.nike.com' },
    { name: 'Adidas', url: 'https://www.adidas.com' },
    { name: 'Puma', url: 'https://www.puma.com' },
    { name: 'Reebok', url: 'https://www.reebok.com' },
    { name: 'New Balance', url: 'https://www.newbalance.com' }
  ];

  ngOnInit() {}
}