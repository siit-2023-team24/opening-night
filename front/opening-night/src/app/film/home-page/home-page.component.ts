import { Component, OnInit } from '@angular/core';
import { FilmCardDTO } from '../model/film-card';
import { FilmService } from '../film.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { filter } from 'rxjs';
import { MessageResponse } from 'src/env/error-response';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit{

  films: FilmCardDTO[] = [];
  searchTerm: string = '';

  filterForm: FormGroup;

  constructor(private filmService: FilmService, private router: Router,
              private formBuilder: FormBuilder, private authService: AuthService) {
      this.filterForm = this.formBuilder.group({
        title: [null],
        genres: [null],
        directors: [null],
        actors: [null]
      })
  }

  ngOnInit(): void {
    if(!this.authService.isLoggedIn()) this.router.navigate(['login']);
    this.fetchFilms();
  }

  fetchFilms(): void {
    this.filmService.getAllFilms().subscribe({
      next: (films: FilmCardDTO[]) => {
        this.films = films;
      },
      error: (error) => {
        console.error('Error fetching films:', error);
      }
    });

  }

  search(): void {
    console.log(this.searchTerm);
    if (!this.searchTerm) {
      this.filmService.getAllFilms().subscribe({
        next: (films: FilmCardDTO[]) => {
          this.films = films;
        },
        error: (error) => {
          console.error('Error fetching films:', error);
        }
      });
    } else {
      this.filmService.search(this.searchTerm).subscribe({
        next: (data: FilmCardDTO[]) => {
          this.films = data;
        },
        error: (error: MessageResponse) => {
          console.log(error.message);
        }
      });
    }
  }


  filterSearch(): void {
    let data = this.filterForm.value;
    let input = (data.title || '') + '-' + (data.genres || '') + '-' + (data.directors || '') + '-' + (data.actors || '');
    console.log(input);
    this.filmService.searchFilter(input).subscribe({
      next: (data: FilmCardDTO[]) => {
        this.films = data;
      },
      error: (error: MessageResponse) => {
        console.log(error.message);
      }
    });
  }
}

