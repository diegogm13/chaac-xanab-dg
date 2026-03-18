import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-terminos-uso',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './terminos-uso.component.html',
    styleUrl: './terminos-uso.component.css'
})
export class TerminosUsoComponent {
    lastUpdated: string = '23 de febrero de 2026';
}
