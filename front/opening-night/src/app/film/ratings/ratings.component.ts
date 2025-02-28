import { Component, Input, OnInit } from '@angular/core';
import { RatingService } from '../rating.service';
import { Rating } from '../model/rating';
import { MessageResponse } from 'src/env/error-response';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {

  @Input()
  filmId: string = '';

  @Input()
  genres: string[] = [];

  @Input()
  directors: string[] = [];

  @Input()
  actors: string[] = [];

  stars: boolean[] = [false, false, false, false, false]
  rating: number = 0;
  noRating: boolean = false;

  ratings: Rating[] = [
    // {username: 'test', filmId: 'f123', timestamp: '12.12.1212.', stars: 4},
    // {username: 'test', filmId: 'f123', timestamp: '12.12.1212.', stars: 4},
    // {username: 'test', filmId: 'f123', timestamp: '12.12.1212.', stars: 4},
    // {username: 'test', filmId: 'f123', timestamp: '12.12.1212.', stars: 4},
    // {username: 'test', filmId: 'f123', timestamp: '12.12.1212.', stars: 4}
  ];

  constructor(private service: RatingService, private authService: AuthService) {}

  ngOnInit(): void {
    this.service.get(this.filmId).subscribe({
      next: (data: Rating[]) => {
        this.ratings = data;
      },
      error: (_ => console.error('Error getting ratings'))
    });
  }


  rateStar(rating: number): void {
    this.noRating = false;
    for (let i=0; i<rating; i++) {
      this.stars[i] = true;
    }
    for (let i=rating; i<5; i++) {
      this.stars[i] = false;
    }
    this.rating = rating;
  }

  

  saveReview(): void {
    if (this.rating==0) {
      this.noRating = true;
      return;
    }

    //TODO DONE?
    const username = this.authService.getUsername();
    
    const dto: Rating = {
      filmId: this.filmId,
      username: username,
      stars: this.rating,
      genres: this.genres,
      directors: this.directors,
      actors: this.actors
    }

      this.service.rate(dto).subscribe({
        next: (response: MessageResponse) => {
          console.log(response.message);
          this.ngOnInit();
        },
        error: (error: MessageResponse) => {
          console.log(error.message);
        }
      })
  }

}
