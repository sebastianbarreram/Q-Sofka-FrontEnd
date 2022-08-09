import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Pregunta } from '../models/pregunta';
import { PathRest } from '../static/hostBackend';

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {
  preguntaUrl:string = 'http://localhost:8080/api/pregunta/listar';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient) { }


  getPreguntas(): Observable<Pregunta[]>{
    return this.http.get<Pregunta[]>(this.preguntaUrl)
    .pipe(
      catchError(this.handleError<Pregunta[]>('getPreguntas', []))
    );
  }

  /** DELETE: delete the question from the server */
  deletePregunta(preguntaId: string|undefined): Observable<Pregunta> {
    const url = `${PathRest.getApiPregunta}/${preguntaId}`;
    return this.http.delete<Pregunta>(url, this.httpOptions).pipe(
      tap(_ => console.log(`deleted card cardId=${preguntaId}`)),
      catchError(this.handleError<Pregunta>('deleteCard'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead


      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
