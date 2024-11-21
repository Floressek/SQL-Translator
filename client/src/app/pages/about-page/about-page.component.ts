import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DataFetchingService } from '../../services/data-fetching.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
})
export class AboutPageComponent implements OnInit {
  readonly dataFetchingService = inject(DataFetchingService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly currentPath = '/' + this.activatedRoute.routeConfig?.path;

  ngOnInit(): void {
    this.dataFetchingService.fetchAboutPageContent();

    this.activatedRoute.fragment.subscribe({
      next: (fragment) => {
        this.scrollToSection(fragment!);
      },
    });
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
