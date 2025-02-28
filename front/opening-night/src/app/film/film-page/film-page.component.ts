import { Component, ElementRef, ViewChild } from '@angular/core';
import { FilmService } from '../film.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesEpisodeDTO } from '../model/series-episode';
import { FilmDetailsDTO } from '../model/film-details';
import { FilmFeedDTO } from '../model/film_feed';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageResponse } from 'src/env/error-response';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-film-page',
  templateUrl: './film-page.component.html',
  styleUrls: ['./film-page.component.css']
})
export class FilmPageComponent {

  filmDTO: FilmDetailsDTO = {
    filmId: '',
    fileName: '',
    title: '',
    description: '',
    actors: [],
    directors: [],
    genres: [],
    isSeries: false,
    fileContentOriginal: '',
    fileContent360p: '',
    fileContent144p: ''
  };

  filmFile: File | undefined;
  filmId: string = '';
  seasons: number[] = []
  episodes: SeriesEpisodeDTO[] = []
  selectedQuality: string = 'original';

  role: string;

  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement> | undefined;
  videoSource: string | ArrayBuffer | null = null;

  constructor(
    private filmService: FilmService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    this.role = authService.getRole();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.filmId = params['id'];
      this.fetchFilmData();
    });
  }

  fetchFilmData(): void {
    this.filmService.getFilmById(this.filmId).subscribe(response => {
      this.filmDTO = response;
      console.log(this.filmDTO);
      this.convertBase64ToVideo();
      if (this.filmDTO.isSeries && this.filmDTO.series) {
        this.getSeriesEpisodes();
      }
    }, error => {
      console.log('Error fetching film data', error);
    });

  }

  getSeriesEpisodes() {
    this.filmService.getEpisodesBySeries(this.filmDTO.series).subscribe(response => {
      this.episodes = response;
      this.episodes.forEach(ep => {
        if(!this.seasons.includes(ep.season))
          this.seasons.push(ep.season);
      });
  
      console.log(this.seasons)
      this.seasons.sort((a, b) => a - b);
    }, error => {
      console.log('Error fetching film data', error);
    });

  }

  loadEpisode(id: string): void {
    this.filmService.getFilmById(id).subscribe(response => {
      this.filmDTO = response;
      console.log(this.filmDTO)
      this.convertBase64ToVideo();
    }, error => {
      console.log('Error fetching episode data', error);
    });
  }

  convertBase64ToVideo(): void {
    if (this.filmDTO.fileContentOriginal) {
      this.videoSource = 'data:video/mp4;base64,' + this.filmDTO.fileContentOriginal;
      if(this.videoPlayer) {
          const video: HTMLVideoElement = this.videoPlayer.nativeElement;
          video.load();
      }
    }
  }

  onQualityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedQuality = target.value;
    this.updateVideoSource();
  }

  updateVideoSource(): void {
    if (this.videoPlayer) {
      const video: HTMLVideoElement = this.videoPlayer.nativeElement;
      let fileContent: string | null = null;

      switch (this.selectedQuality) {
        case 'original':
          fileContent = this.filmDTO.fileContentOriginal;
          break;
        case '360p':
          fileContent = this.filmDTO.fileContent360p;
          break;
        case '144p':
          fileContent = this.filmDTO.fileContent144p;
          break;
      }

      if (fileContent) {
        const videoSource = 'data:video/mp4;base64,' + fileContent;
        video.src = videoSource;
        video.load();
      }
    }
  }

  download() {
    let name = this.filmId;
    if (this.selectedQuality == '360p')
      name += '_360p';
    if (this.selectedQuality == '144p')
      name += '_144p';

    let dto: FilmFeedDTO = {
      filmId: this.filmId,
      title: this.filmDTO.title,
      actors: this.filmDTO.actors,
      directors: this.filmDTO.directors,
      genres: this.filmDTO.genres,
      isSeries: this.filmDTO.isSeries,
      username: this.authService.getUsername()
    }
    this.filmService.download(name, dto).subscribe({
      next: (data: any)=> {
        console.log(data);
        alert(data['url']);
        window.open(data['url'], '_blank');
      },error: (error: any)=> {
        console.log('Error fetching film data', error);
      }
    })
    
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  deleteFilm() {
    this.filmService.delete(this.filmId).subscribe({
      next: (data: MessageResponse)=> {
        console.log(data.message);
        this.showSnackBar(data.message);
        this.router.navigate(['home']);
      },
      error: (error: any)=> {
        console.log('Error fetching film data', error);
      }
    })
  }

}
